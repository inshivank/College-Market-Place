import express from "express";
import { requireRole, verifyToken } from "../middleware/auth.js";
import Item from "../models/Item.js";
import User from "../models/User.js";

const router = express.Router();
const adminOnly = [verifyToken, requireRole("admin")];
const staffOnly = [verifyToken, requireRole("admin", "manager")];

router.get("/stats", staffOnly, async (req, res) => {
  try {
    const [totalUsers, totalItems, activeItems, pendingItems, viewsResult] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Item.countDocuments({ status: "active" }),
      Item.countDocuments({ status: "pending" }),
      Item.aggregate([{ $group: { _id: null, totalViews: { $sum: "$views" } } }])
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalItems,
        activeItems,
        pendingItems,
        totalViews: viewsResult[0]?.totalViews || 0
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch admin stats", error: error.message });
  }
});

router.get("/users", adminOnly, async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments()
    ]);

    return res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch users", error: error.message });
  }
});

router.put("/users/:id/role", adminOnly, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "manager", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be user, manager, or admin" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User role updated", user });
  } catch (error) {
    return res.status(500).json({ message: "Could not update user role", error: error.message });
  }
});

router.delete("/users/:id", adminOnly, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account from this panel" });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete user", error: error.message });
  }
});

router.get("/items", staffOnly, async (req, res) => {
  try {
    const query = {};

    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status;
    }

    const items = await Item.find(query)
      .populate("seller", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch admin items", error: error.message });
  }
});

router.put("/items/:id/status", staffOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "pending", "sold"].includes(status)) {
      return res.status(400).json({ message: "Status must be active, pending, or sold" });
    }

    const item = await Item.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate(
      "seller",
      "name email phone"
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({ message: "Item status updated", item });
  } catch (error) {
    return res.status(500).json({ message: "Could not update item status", error: error.message });
  }
});

router.delete("/items/:id", adminOnly, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete item", error: error.message });
  }
});

export default router;
