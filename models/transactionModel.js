// src/models/transactionModel.js

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ["income", "expense", "borrow", "repay", "credit", "credit-repay"],
    required: true,
  },
  paymentMode: { type: String, required: true },
  shared: { type: Boolean, default: false },
  people: { type: Number, default: 1 },
  userShare: { type: Number, required: true },
  description: { type: String, default: "" },
  isCredit: { type: Boolean, default: false },
});

module.exports = mongoose.model("Transaction", transactionSchema);
