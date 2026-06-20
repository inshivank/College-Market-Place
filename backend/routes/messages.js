import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import Conversation from "../models/Conversation.js";
import Item from "../models/Item.js";
import Message from "../models/Message.js";
import UserReport from "../models/UserReport.js";
import { verifyToken } from "../middleware/auth.js";
import { uploadImageToCloudinary } from "../middleware/upload.js";

const router = express.Router();
const imageUpload = multer({
  storage: multer.memoryStorage(), limits: { files: 1, fileSize: 10 * 1024 * 1024 },
  fileFilter(req, file, callback) { return file.mimetype.startsWith("image/") ? callback(null, true) : callback(new Error("Message attachment must be an image")); }
});

function optionalImage(req, res, next) {
  imageUpload.single("image")(req, res, (error) => {
    if (!error) return next();
    return res.status(400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "Image must be 10 MB or smaller" : error.message });
  });
}

function participantQuery(userId) { return { $or: [{ buyer: userId }, { seller: userId }] }; }
function isParticipant(conversation, userId) { return [conversation.buyer?._id || conversation.buyer, conversation.seller?._id || conversation.seller].some((id) => String(id) === String(userId)); }
function isBlocked(conversation) { return conversation.blockedBy?.length > 0; }

async function createMessage(conversation, senderId, text, file) {
  const cleanText = String(text || "").trim().slice(0, 2000);
  if (!cleanText && !file) throw Object.assign(new Error("Write a message or attach an image"), { status: 400 });
  let image = "";
  if (file) image = (await uploadImageToCloudinary(file.buffer)).secure_url;
  const message = await Message.create({ conversation: conversation._id, sender: senderId, text: cleanText, image });
  conversation.lastMessage = cleanText || "📷 Image";
  await conversation.save();
  return message.populate("sender", "name avatar");
}

router.use(verifyToken);

router.post("/", optionalImage, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.body.itemId)) return res.status(400).json({ message: "A valid item is required" });
    const item = await Item.findById(req.body.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (String(item.seller) === String(req.user.id)) return res.status(400).json({ message: "You cannot message yourself about your own listing" });
    const conversation = await Conversation.findOneAndUpdate(
      { buyer: req.user.id, seller: item.seller, item: item._id },
      { $setOnInsert: { buyer: req.user.id, seller: item.seller, item: item._id } },
      { new: true, upsert: true, runValidators: true }
    );
    if (isBlocked(conversation)) return res.status(403).json({ message: "Messaging is unavailable for this conversation" });
    const message = await createMessage(conversation, req.user.id, req.body.text, req.file);
    await conversation.populate([{ path: "buyer", select: "name avatar" }, { path: "seller", select: "name avatar phone email verified createdAt" }, { path: "item", select: "title images price status" }]);
    return res.status(201).json({ conversation, message });
  } catch (error) { return res.status(error.status || 500).json({ message: error.message || "Could not send message" }); }
});

router.get("/conversations", async (req, res) => {
  try {
    const conversations = await Conversation.find(participantQuery(req.user.id)).populate("buyer", "name avatar").populate("seller", "name avatar").populate("item", "title images price status").sort({ updatedAt: -1 }).lean();
    const ids = conversations.map((conversation) => conversation._id);
    const unread = ids.length ? await Message.aggregate([{ $match: { conversation: { $in: ids }, sender: { $ne: new mongoose.Types.ObjectId(req.user.id) }, read: false } }, { $group: { _id: "$conversation", count: { $sum: 1 } } }]) : [];
    const unreadMap = new Map(unread.map((entry) => [String(entry._id), entry.count]));
    return res.status(200).json({ conversations: conversations.map((conversation) => ({ ...conversation, unreadCount: unreadMap.get(String(conversation._id)) || 0 })), unreadCount: unread.reduce((sum, entry) => sum + entry.count, 0) });
  } catch (error) { return res.status(500).json({ message: "Could not fetch conversations", error: error.message }); }
});

router.patch("/read", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.body.conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (!isParticipant(conversation, req.user.id)) return res.status(403).json({ message: "You cannot access this conversation" });
    const result = await Message.updateMany({ conversation: conversation._id, sender: { $ne: req.user.id }, read: false }, { read: true });
    return res.status(200).json({ message: "Messages marked as read", updated: result.modifiedCount });
  } catch (error) { return res.status(500).json({ message: "Could not mark messages as read", error: error.message }); }
});

router.get("/:conversationId", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId).populate("buyer", "name avatar").populate("seller", "name avatar phone email verified").populate("item", "title images price status");
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (!isParticipant(conversation, req.user.id)) return res.status(403).json({ message: "You cannot access this conversation" });
    const messages = await Message.find({ conversation: conversation._id }).populate("sender", "name avatar").sort({ createdAt: 1 });
    return res.status(200).json({ conversation, messages });
  } catch (error) { return res.status(500).json({ message: "Could not fetch messages", error: error.message }); }
});

router.post("/:conversationId", optionalImage, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (!isParticipant(conversation, req.user.id)) return res.status(403).json({ message: "You cannot access this conversation" });
    if (isBlocked(conversation)) return res.status(403).json({ message: "Messaging is unavailable for this conversation" });
    const message = await createMessage(conversation, req.user.id, req.body.text, req.file);
    return res.status(201).json({ message });
  } catch (error) { return res.status(error.status || 500).json({ message: error.message || "Could not send message" }); }
});

router.patch("/:conversationId/block", async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (String(conversation.seller) !== String(req.user.id)) return res.status(403).json({ message: "Only the seller can block this buyer" });
    const blocked = req.body.blocked !== false;
    conversation.blockedBy = blocked ? [req.user.id] : [];
    await conversation.save();
    return res.status(200).json({ message: blocked ? "Buyer blocked" : "Buyer unblocked", blocked });
  } catch (error) { return res.status(500).json({ message: "Could not update block status", error: error.message }); }
});

router.post("/:conversationId/report", async (req, res) => {
  try {
    const reason = String(req.body.reason || "").trim().slice(0, 1000);
    if (reason.length < 10) return res.status(400).json({ message: "Please provide at least 10 characters" });
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (String(conversation.buyer) !== String(req.user.id)) return res.status(403).json({ message: "Only the buyer can report this seller" });
    const report = await UserReport.create({ reporter: req.user.id, reportedUser: conversation.seller, conversation: conversation._id, reason });
    return res.status(201).json({ message: "Seller reported for review", reportId: report._id });
  } catch (error) { return res.status(500).json({ message: "Could not submit report", error: error.message }); }
});

export default router;
