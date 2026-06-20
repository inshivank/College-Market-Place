import express from "express";
import Item from "../models/Item.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
  }

  return String(tags || "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeWhatsAppNumber(value) {
  const raw = String(value || "").trim();
  const normalized = raw.startsWith("+")
    ? `+${raw.slice(1).replace(/\D/g, "")}`
    : raw.replace(/\D/g, "");
  const digits = normalized.replace(/\D/g, "");

  return digits.length >= 7 && digits.length <= 15 ? normalized : "";
}

function canManageItem(user, item) {
  const sellerId = item.seller?._id || item.seller;
  return String(sellerId) === user.id || ["admin", "manager"].includes(user.role);
}

function canDeleteItem(user, item) {
  const sellerId = item.seller?._id || item.seller;
  return String(sellerId) === user.id || user.role === "admin";
}

function tokenizeTags(tags) {
  return tags
    .join(" ")
    .toLowerCase()
    .replace(/#/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

function termFrequency(term, document) {
  if (document.length === 0) {
    return 0;
  }

  return document.filter((word) => word === term).length / document.length;
}

function inverseDocumentFrequency(term, documents) {
  const documentsWithTerm = documents.filter((document) => document.includes(term)).length;
  return documentsWithTerm === 0 ? 0 : Math.log(documents.length / documentsWithTerm);
}

function cosineSimilarity(vectorA, vectorB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < vectorA.length; index += 1) {
    dotProduct += vectorA[index] * vectorB[index];
    magnitudeA += vectorA[index] * vectorA[index];
    magnitudeB += vectorB[index] * vectorB[index];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function buildTfidfVectors(items) {
  const documents = items.map((item) => tokenizeTags(item.tags || []));
  const vocabulary = [...new Set(documents.flat())];

  return documents.map((document) =>
    vocabulary.map((term) => termFrequency(term, document) * inverseDocumentFrequency(term, documents))
  );
}

router.get("/", async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } }
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    const sortOptions = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name: { title: 1 },
      newest: { createdAt: -1 }
    };

    const items = await Item.find(query)
      .populate("seller", "name email phone avatar")
      .sort(sortOptions[sort] || sortOptions.newest);

    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch items", error: error.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, price, category, tags, images, condition, status, whatsappNumber } = req.body;

    if (!title || !description || price === undefined || !category || !condition || !whatsappNumber) {
      return res.status(400).json({
        message: "Title, description, price, category, condition, and WhatsApp number are required"
      });
    }

    const normalizedWhatsAppNumber = normalizeWhatsAppNumber(whatsappNumber);
    if (!normalizedWhatsAppNumber) {
      return res.status(400).json({ message: "Please provide a valid WhatsApp number with country code" });
    }

    const item = await Item.create({
      title,
      description,
      price,
      category,
      condition,
      status,
      tags: normalizeTags(tags),
      images: Array.isArray(images) ? images.filter(Boolean) : [],
      whatsappNumber: normalizedWhatsAppNumber,
      seller: req.user.id
    });

    await item.populate("seller", "name email phone avatar");

    return res.status(201).json({ message: "Item created successfully", item });
  } catch (error) {
    return res.status(500).json({ message: "Could not create item", error: error.message });
  }
});

router.get("/:id/recommendations", async (req, res) => {
  try {
    const selectedItem = await Item.findById(req.params.id);

    if (!selectedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    const items = await Item.find({ _id: { $ne: selectedItem._id } }).populate(
      "seller",
      "name email phone avatar"
    );
    const dataset = [selectedItem, ...items];
    const vectors = buildTfidfVectors(dataset);
    const selectedVector = vectors[0];
    const selectedTags = new Set(tokenizeTags(selectedItem.tags || []));

    const recommendations = items
      .map((item, index) => {
        const itemTags = tokenizeTags(item.tags || []);
        return {
          item,
          score: cosineSimilarity(selectedVector, vectors[index + 1]),
          matchingTags: itemTags.filter((tag) => selectedTags.has(tag))
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    return res.status(200).json({ recommendations });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch recommendations", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("seller", "name email phone avatar verified createdAt");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const totalListings = await Item.countDocuments({ seller: item.seller?._id || item.seller });
    return res.status(200).json({ item, sellerStats: { totalListings, averageResponseTime: "Usually within a day" } });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch item", error: error.message });
  }
});

router.put("/:id", verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (!canManageItem(req.user, item)) {
      return res.status(403).json({ message: "You do not have permission to edit this item" });
    }

    const allowedFields = [
      "title",
      "description",
      "price",
      "category",
      "images",
      "condition",
      "status",
      "whatsappNumber"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = field === "whatsappNumber" ? normalizeWhatsAppNumber(req.body[field]) : req.body[field];
      }
    });

    if (req.body.whatsappNumber !== undefined && !item.whatsappNumber) {
      return res.status(400).json({ message: "Please provide a valid WhatsApp number with country code" });
    }

    if (req.body.tags !== undefined) {
      item.tags = normalizeTags(req.body.tags);
    }

    await item.save();
    await item.populate("seller", "name email phone avatar");

    return res.status(200).json({ message: "Item updated successfully", item });
  } catch (error) {
    return res.status(500).json({ message: "Could not update item", error: error.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (!canDeleteItem(req.user, item)) {
      return res.status(403).json({ message: "You do not have permission to delete this item" });
    }

    await item.deleteOne();

    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete item", error: error.message });
  }
});

export default router;
