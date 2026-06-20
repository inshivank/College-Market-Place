import express from "express";
import multer from "multer";
import Feedback, { feedbackCategories, feedbackStatuses } from "../models/Feedback.js";
import User from "../models/User.js";
import { requireRole, verifyToken } from "../middleware/auth.js";
import { uploadImageToCloudinary } from "../middleware/upload.js";

const router = express.Router();
const screenshotUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, callback) {
    return file.mimetype.startsWith("image/")
      ? callback(null, true)
      : callback(new Error("Screenshot must be an image"));
  }
});

function uploadSingleScreenshot(req, res, next) {
  screenshotUpload.single("screenshot")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "Screenshot must be 10 MB or smaller" : error.message });
    }
    return next();
  });
}

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

router.use(verifyToken);

router.post("/", uploadSingleScreenshot, async (req, res) => {
  try {
    const category = clean(req.body.category, 50);
    const message = clean(req.body.message, 1000);
    const rating = req.body.rating ? Number(req.body.rating) : null;

    if (!feedbackCategories.includes(category)) {
      return res.status(400).json({ message: "Please select a valid feedback category" });
    }
    if (message.length < 10) {
      return res.status(400).json({ message: "Feedback must be at least 10 characters" });
    }
    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const user = await User.findById(req.user.id).select("name email");
    if (!user) {
      return res.status(401).json({ message: "User account was not found" });
    }

    let screenshot = "";
    if (req.file) {
      const uploaded = await uploadImageToCloudinary(req.file.buffer);
      screenshot = uploaded.secure_url;
    }

    const feedback = await Feedback.create({
      user: user._id,
      name: user.name,
      email: user.email,
      category,
      rating,
      message,
      screenshot,
      allowContact: req.body.allowContact === "true" || req.body.allowContact === true,
      page: clean(req.body.page, 2048),
      browser: clean(req.body.browser, 120) || "Unknown",
      os: clean(req.body.os, 120) || "Unknown",
      screen: clean(req.body.screen, 40) || "Unknown"
    });

    return res.status(201).json({ message: "Feedback submitted successfully", feedback });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not submit feedback" });
  }
});

router.get("/", async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { user: req.user.id };
    const { category, rating, status, search } = req.query;
    if (category && feedbackCategories.includes(category)) query.category = category;
    if (rating && Number(rating) >= 1 && Number(rating) <= 5) query.rating = Number(rating);
    if (status && feedbackStatuses.includes(status)) query.status = status;
    if (search && req.user.role === "admin") {
      const term = clean(search, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = ["name", "email", "message"].map((field) => ({ [field]: { $regex: term, $options: "i" } }));
    }
    const feedback = await Feedback.find(query).populate("user", "name email").sort({ createdAt: -1 });
    return res.status(200).json({ feedback });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch feedback", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate("user", "name email");
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    if (req.user.role !== "admin" && String(feedback.user?._id || feedback.user) !== req.user.id) {
      return res.status(403).json({ message: "You do not have permission to view this feedback" });
    }
    return res.status(200).json({ feedback });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch feedback", error: error.message });
  }
});

router.patch("/:id", requireRole("admin"), async (req, res) => {
  try {
    if (!feedbackStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Please select a valid status" });
    }
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }).populate("user", "name email");
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    return res.status(200).json({ message: "Feedback status updated", feedback });
  } catch (error) {
    return res.status(500).json({ message: "Could not update feedback", error: error.message });
  }
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });
    return res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete feedback", error: error.message });
  }
});

export default router;
