import mongoose from "mongoose";

export const feedbackCategories = [
  "Bug Report",
  "Feature Request",
  "UI / UX",
  "Performance",
  "Marketplace Listing",
  "General Feedback"
];

export const feedbackStatuses = ["New", "In Review", "Planned", "Resolved", "Closed"];

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    category: { type: String, enum: feedbackCategories, required: true, index: true },
    rating: { type: Number, min: 1, max: 5, default: null },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    screenshot: { type: String, trim: true, default: "" },
    allowContact: { type: Boolean, default: false },
    page: { type: String, trim: true, maxlength: 2048, default: "" },
    browser: { type: String, trim: true, maxlength: 120, default: "Unknown" },
    os: { type: String, trim: true, maxlength: 120, default: "Unknown" },
    screen: { type: String, trim: true, maxlength: 40, default: "Unknown" },
    status: { type: String, enum: feedbackStatuses, default: "New", index: true }
  },
  { timestamps: true }
);

feedbackSchema.index({ createdAt: -1 });

export default mongoose.model("Feedback", feedbackSchema);
