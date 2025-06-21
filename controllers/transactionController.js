const Transaction = require('../models/transactionModel');
const { getCategoryEmoji } = require('../utils/categoryUtils');

// Create a transaction
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
      description,
    } = req.body;

    const userShare = shared ? amount / people : amount;

    const transaction = await Transaction.create({
      userId: req.user._id,
      date,
      category,
      amount,
      type,
      paymentMode,
      shared,
      people,
      userShare,
      description,
    });

    // Add emoji in response only
    const withEmoji = {
      ...transaction._doc,
      emoji: getCategoryEmoji(transaction.category),
    };

    res.status(201).json({ message: 'Transaction created', transaction: withEmoji });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all transactions (with filters, pagination)
exports.getTransactions = async (req, res) => {
  // console.log('Fetching transactions for user:', req.user);
  const { page = 1, limit = 10, startDate, endDate, type } = req.query;

  const filters = { userId: req.user._id };
  if (type) filters.type = type;
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

    const enhanced = transactions.map(tx => ({
      ...tx._doc,
      emoji: getCategoryEmoji(tx.category),
    }));

    const total = await Transaction.countDocuments(filters);

    res.json({
      transactions: enhanced,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalTransactions: total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const withEmoji = {
      ...transaction._doc,
      emoji: getCategoryEmoji(transaction.category),
    };

    res.json(withEmoji);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const {
      date,
      category,
      amount,
      type,
      paymentMode,
      shared,
      people,
      description,
    } = req.body;

    if (date !== undefined) transaction.date = date;
    if (category !== undefined) transaction.category = category;
    if (amount !== undefined) transaction.amount = amount;
    if (type !== undefined) transaction.type = type;
    if (paymentMode !== undefined) transaction.paymentMode = paymentMode;
    if (shared !== undefined) transaction.shared = shared;
    if (people !== undefined) transaction.people = people;
    if (description !== undefined) transaction.description = description;

    transaction.userShare = transaction.shared
      ? transaction.amount / (transaction.people || 1)
      : transaction.amount;

    await transaction.save();

    const withEmoji = {
      ...transaction._doc,
      emoji: getCategoryEmoji(transaction.category),
    };

    res.json({ message: 'Transaction updated', transaction: withEmoji });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
