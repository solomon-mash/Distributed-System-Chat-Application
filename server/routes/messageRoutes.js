const express = require("express");
const Message = require("../models/messageModel");
const { expressAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// chat history between two users
router.get("/:userId", expressAuth, async (req, res) => {
  const myId = req.user.id;
  const userId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { sender: myId, receiver: userId },
      { sender: userId, receiver: myId },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
});

// group chat history
router.get("/", expressAuth, async (req, res) => {
  const messages = await Message.find({ isGroup: true })
    .populate("sender", "username email")
    .sort({ createdAt: 1 });
  res.json(messages);
});


module.exports = router;
