import express from "express";
import { verifyToken } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", verifyToken, (req, res) => {
  upload.array("images", 4)(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || "Image upload failed" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Please upload at least one image" });
    }

    const urls = req.files.map((file) => file.path);

    return res.status(201).json({
      message: "Images uploaded successfully",
      urls
    });
  });
});

console.log("Upload router loaded: POST /");

export default router;
