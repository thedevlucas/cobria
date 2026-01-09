// Dependencies
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  id_user: {
    type: Number,
    required: true,
  },
  from_cellphone: {
    type: Number,
    required: true,
  },
  to_cellphone: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: Buffer,
    required: false,
  },
  image_type: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    default: true,
  },
});

export const Chat = mongoose.model("Chat", chatSchema);0
