import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  category: {
    type: String,
    enum: ["Books", "Electronics", "Clothes", "Others"],
    required: [true, "Category is required"]
  },
  tags: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Seller is required"]
  },
  condition: {
    type: String,
    enum: ["new", "used"],
    required: [true, "Condition is required"]
  },
  status: {
    type: String,
    enum: ["active", "pending", "sold"],
    default: "pending"
  },
  wishlistedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Item = mongoose.model("Item", itemSchema);

export default Item;
