// Dependencies
const mongoose = require("mongoose");

const callSchema = new mongoose.Schema({
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
  status: {
    type: Boolean,
    default: true,
  },
});

export const CallChat = mongoose.model("Call_Chat", callSchema);
