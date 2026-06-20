import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true, index: true },
    lastMessage: { type: String, trim: true, maxlength: 240, default: "" },
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

conversationSchema.index({ buyer: 1, seller: 1, item: 1 }, { unique: true });
conversationSchema.index({ buyer: 1, updatedAt: -1 });
conversationSchema.index({ seller: 1, updatedAt: -1 });

export default mongoose.model("Conversation", conversationSchema);
