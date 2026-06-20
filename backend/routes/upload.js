import express from "express";
import { verifyToken } from "../middleware/auth.js";
import upload, { uploadImageToCloudinary } from "../middleware/upload.js";

const router = express.Router();

router.post("/", verifyToken, (req, res) => {
  upload.array("images", 4)(req, res, async (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || "Image upload failed" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Please upload at least one image" });
    }

    try {
      const uploadedImages = await Promise.all(
        req.files.map((file) => uploadImageToCloudinary(file.buffer))
      );
      const urls = uploadedImages.map((image) => image.secure_url);

      return res.status(201).json({
        message: "Images uploaded successfully",
        urls
      });
    } catch (uploadError) {
      return res.status(500).json({
        message: uploadError.message || "Image upload failed"
      });
    }
  });
});

console.log("Upload router loaded: POST /");

export default router;
