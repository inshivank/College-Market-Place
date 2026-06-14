import express from "express";
import Item from "../models/Item.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/:itemId", verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const alreadyWishlisted = item.wishlistedBy.some((userId) => String(userId) === req.user.id);

    if (alreadyWishlisted) {
      item.wishlistedBy = item.wishlistedBy.filter((userId) => String(userId) !== req.user.id);
    } else {
      item.wishlistedBy.push(req.user.id);
    }

    await item.save();

    return res.status(200).json({
      message: alreadyWishlisted ? "Item removed from wishlist" : "Item added to wishlist",
      wishlisted: !alreadyWishlisted,
      itemId: item._id
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not update wishlist", error: error.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const items = await Item.find({ wishlistedBy: req.user.id })
      .populate("seller", "name email phone avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch wishlist", error: error.message });
  }
});

export default router;
