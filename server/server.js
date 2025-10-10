require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const winston = require('winston');
const onlineUsers = new Map();

const authRoutes = require('./routes/authRoutes');
const { expressAuth, socketAuthMiddleware } = require('./middleware/authMiddleware');
const Message = require('./models/messageModel');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const NODE_NAME = process.env.NODE_NAME || `node-${PORT}`;
const MONGO_URI = process.env.MONGO_URI;

const logger = winston.createLogger({
  transports: [new winston.transports.Console({ format: winston.format.simple() })],
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/messages/group', expressAuth, async (req, res) => {
  try {
    const messages = await Message.find({ isGroup: true })
      .populate('sender', 'username')
      .sort({ createdAt: 1 })
      .lean();
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch group messages' });
  }
});

app.get('/api/messages', expressAuth, async (req, res) => {
  const limit = Number(req.query.limit || 50);
  const docs = await Message.find().sort({ createdAt: -1 }).limit(limit).lean();
  res.json(docs.reverse());
});

(async function main() {
  await mongoose.connect(MONGO_URI);
  logger.info(`[${NODE_NAME}] Connected to MongoDB`);

  const io = new Server(server, {
    cors: {
      origin: 'https://group-info-chat.vercel.app',
      methods: ['GET', 'POST'],
    },
  });


  // 🔐 Socket authentication
  io.use((socket, next) => socketAuthMiddleware(socket, next));

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    onlineUsers.set(userId, socket.id);

    // Join global room
    socket.join('global');

    io.emit('users', Array.from(onlineUsers.keys()));

    socket.on('privateMessage', async ({ to, text }) => {
      try {
        const message = await Message.create({ sender: userId, receiver: to, text });
        const receiverSocketId = onlineUsers.get(to);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit('privateMessage', {
            sender: { _id: userId },
            receiver: { _id: to },
            text,
            createdAt: message.createdAt,
          });
        }

        socket.emit('privateMessage', {
          sender: { _id: userId },
          receiver: { _id: to },
          text,
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error('Private message error:', err);
      }
    });

    socket.on('groupMessage', async ({ text }) => {
      try {
        const message = await Message.create({
          sender: userId,
          receiver: null,
          text,
          isGroup: true,
        });

        const populatedMsg = await message.populate('sender', 'username');

        io.to('global').emit('groupMessage', populatedMsg);
      } catch (err) {
        console.error('Group message error:', err);
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('users', Array.from(onlineUsers.keys()));
    });
  });

  const changeStream = Message.watch([{ $match: { operationType: 'insert' } }], {
    fullDocument: 'updateLookup',
  });
  changeStream.on('change', (change) => {
    const doc = change.fullDocument;
    logger.info(`[${NODE_NAME}] changeStream insert -> broadcasting`);
    io.emit('message', doc);
  });

  server.listen(PORT, () => {
    logger.info(`[${NODE_NAME}] Server listening on ${PORT}`);
  });

  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await changeStream.close();
    await mongoose.disconnect();
    process.exit(0);
  });
})();
