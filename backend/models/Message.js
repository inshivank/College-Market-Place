import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, trim: true, maxlength: 2000, default: "" },
  image: { type: String, trim: true, default: "" },
  read: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now }
});

messageSchema.index({ conversation: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
