const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User" },
  text: { type: String, required: true },
  isGroup: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now },
  node: { type: String },
});

module.exports = mongoose.model("Message", MessageSchema);
