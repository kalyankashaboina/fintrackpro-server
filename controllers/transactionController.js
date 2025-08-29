const Transaction = require("../models/transactionModel");

const validTypes = [
  "income",
  "expense",
  "borrow",
  "repay",
  "credit",
  "credit-repay",
];

const formatTransaction = (tx) => ({
  id: tx._id,
  date: tx.date,
  category: tx.category,
  amount: tx.amount,
  type: tx.type,
  paymentMode: tx.paymentMode,
  shared: tx.shared,
  people: tx.people,
  userShare: tx.userShare,
  description: tx.description || "",
  isCredit: tx.isCredit || false,
});

exports.createTransaction = async (req, res) => {
  try {
    const {
      date,
      category,
      amount,
      type,
      paymentMode,
      shared = false,
      people = 1,
      description = "",
    } = req.body;

    if (!date || !category || !amount || !type || !paymentMode) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    if (!validTypes.includes(type)) {
      return res
        .status(400)
        .json({ success: false, message: "`type` is not valid" });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return res
        .status(400)
        .json({ success: false, message: "Amount must be a valid number" });
    }

    const userShare = shared ? parsedAmount / (people || 1) : parsedAmount;
    const isCredit = type === "credit" || type === "credit-repay";

    const transaction = await Transaction.create({
      userId: req.user._id,
      date: new Date(date),
      category,
      amount: parsedAmount,
      type,
      paymentMode,
      shared,
      people,
      userShare,
      description,
      isCredit,
    });

    res.status(201).json({
      success: true,
      message: "Transaction created",
      data: formatTransaction(transaction),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ===================================================================
// THIS IS THE UPDATED FUNCTION
// ===================================================================
exports.getTransactions = async (req, res) => {
  // Destructure all possible query parameters
  const {
    page = 1,
    limit = 10,
    startDate,
    endDate,
    type,
    isCredit,
    paymentMode, // <-- ADDED: Read paymentMode from query
  } = req.query;

  const filters = { userId: req.user._id };

  // Apply filters if they exist
  if (type) filters.type = type;
  if (isCredit !== undefined) filters.isCredit = isCredit === "true";

  // ADDED: Apply paymentMode filter if provided
  if (paymentMode) filters.paymentMode = paymentMode;

  if (startDate || endDate) {
    filters.date = {};
    if (startDate) filters.date.$gte = new Date(startDate);
    if (endDate) filters.date.$lte = new Date(endDate);
  }

  try {
    const transactions = await Transaction.find(filters)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const formatted = transactions.map(formatTransaction);
    const total = await Transaction.countDocuments(filters);

    res.json({
      success: true,
      message: "Transactions fetched successfully",
      data: formatted,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalTransactions: total,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }
    res.json({ success: true, data: formatTransaction(transaction) });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    const allowedFields = [
      "date",
      "category",
      "amount",
      "type",
      "paymentMode",
      "shared",
      "people",
      "description",
    ];
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) transaction[key] = req.body[key];
    });

    if (req.body.type && !validTypes.includes(req.body.type)) {
      return res
        .status(400)
        .json({ success: false, message: "`type` is not valid" });
    }
    if (req.body.amount) {
      const parsedAmount = parseFloat(req.body.amount);
      if (isNaN(parsedAmount)) {
        return res
          .status(400)
          .json({ success: false, message: "Amount must be a valid number" });
      }
      transaction.amount = parsedAmount;
    }

    transaction.userShare = transaction.shared
      ? transaction.amount / (transaction.people || 1)
      : transaction.amount;
    transaction.isCredit =
      transaction.type === "credit" || transaction.type === "credit-repay";

    await transaction.save();
    res.json({
      success: true,
      message: "Transaction updated",
      data: formatTransaction(transaction),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }
    res.json({ success: true, message: "Transaction deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
