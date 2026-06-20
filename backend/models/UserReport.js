import mongoose from "mongoose";

const userReportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    reason: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    status: { type: String, enum: ["New", "Reviewed", "Closed"], default: "New" }
  },
  { timestamps: true }
);

export default mongoose.model("UserReport", userReportSchema);
