// src/controllers/transactionController.js

const Transaction = require('../models/transactionModel');
// --- IMPORT: Bring in your encryption and decryption functions ---
const { encrypt, decrypt } = require('../utils/crypto-util');

const validTypes = ['income', 'expense', 'borrow', 'repay', 'credit', 'credit-repay'];

// --- UPDATED: Centralized formatter now handles DECRYPTION ---
// This function is the single point of truth for preparing data to be sent to the client.
const formatTransaction = (tx) => {
  // Safety check in case a document is malformed or decryption fails
  if (!tx || !tx.amount || !tx.userShare) return null;

  return {
    id: tx._id,
    date: tx.date,
    category: tx.category,
    // DECRYPT the data before sending it to the client
    amount: parseFloat(decrypt(tx.amount)),
    type: tx.type,
    paymentMode: tx.paymentMode,
    shared: tx.shared,
    people: tx.people,
    // DECRYPT the data before sending it to the client
    userShare: parseFloat(decrypt(tx.userShare)),
    description: tx.description || '',
    isCredit: tx.isCredit || false,
  };
};

// --- UPDATED: Handles ENCRYPTION on create ---
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
      description = '',
    } = req.body;

    // Validation for incoming plain-text data
    if (!date || !category || !amount || !type || !paymentMode)
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    if (!validTypes.includes(type))
      return res.status(400).json({ success: false, message: '`type` is not valid' });
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount))
      return res.status(400).json({ success: false, message: 'Amount must be a valid number' });

    const userShare = shared ? parsedAmount / (people || 1) : parsedAmount;
    const isCredit = type === 'credit' || type === 'credit-repay';

    const transaction = await Transaction.create({
      userId: req.user._id,
      date: new Date(date),
      category,
      // ENCRYPT the data before it touches the database
      amount: encrypt(parsedAmount.toString()),
      type,
      paymentMode,
      shared,
      people,
      // ENCRYPT the data before it touches the database
      userShare: encrypt(userShare.toString()),
      description,
      isCredit,
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created',
      data: formatTransaction(transaction), // Formatter decrypts for the response
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// === PERFORMANCE OPTIMIZED & SECURE: GET TRANSACTIONS ===
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, type, isCredit, paymentMode } = req.query;

    const filters = { userId: req.user._id };
    if (type) filters.type = type;
    if (isCredit !== undefined) filters.isCredit = isCredit === 'true';
    if (paymentMode) filters.paymentMode = paymentMode;
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    // PERFORMANCE: Run data and count queries in parallel to reduce response time
    const [transactions, total] = await Promise.all([
      Transaction.find(filters)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Transaction.countDocuments(filters),
    ]);

    // Decrypt all retrieved transactions for the client
    const formatted = transactions.map(formatTransaction).filter(Boolean);

    res.json({
      success: true,
      message: 'Transactions fetched successfully',
      data: formatted,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalTransactions: total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// --- UPDATED: Relies on formatTransaction for DECRYPTION ---
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction)
      return res.status(404).json({ success: false, message: 'Transaction not found' });

    res.json({ success: true, data: formatTransaction(transaction) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// --- UPDATED: Handles ENCRYPTION on update ---
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!transaction)
      return res.status(404).json({ success: false, message: 'Transaction not found' });

    // Decrypt the current amount to work with it
    let currentAmount = parseFloat(decrypt(transaction.amount));

    const allowedFields = [
      'date',
      'category',
      'type',
      'paymentMode',
      'shared',
      'people',
      'description',
    ];
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) transaction[key] = req.body[key];
    });

    if (req.body.amount !== undefined) {
      const parsedAmount = parseFloat(req.body.amount);
      if (isNaN(parsedAmount))
        return res.status(400).json({ success: false, message: 'Amount must be a valid number' });
      currentAmount = parsedAmount; // Update with the new amount from the request
    }

    // Recalculate and RE-ENCRYPT the sensitive fields before saving
    const userShare = transaction.shared
      ? currentAmount / (transaction.people || 1)
      : currentAmount;
    transaction.amount = encrypt(currentAmount.toString());
    transaction.userShare = encrypt(userShare.toString());
    transaction.isCredit = transaction.type === 'credit' || transaction.type === 'credit-repay';

    await transaction.save();
    res.json({
      success: true,
      message: 'Transaction updated',
      data: formatTransaction(transaction),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// --- NO CHANGES NEEDED ---
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!transaction)
      return res.status(404).json({ success: false, message: 'Transaction not found' });

    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// --- UPDATED: Handles ENCRYPTION on bulk create ---
exports.createBulkTransactions = async (req, res) => {
  try {
    const transactionsData = req.body;
    if (!Array.isArray(transactionsData) || transactionsData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be a non-empty array of transactions.',
      });
    }

    const transactionsToCreate = [];
    for (const tx of transactionsData) {
      // Validate incoming plain-text data
      if (!tx.date || !tx.category || !tx.amount || !tx.type || !tx.paymentMode)
        return res.status(400).json({
          success: false,
          message: 'One or more transactions are missing required fields.',
          invalidTransaction: tx,
        });
      if (!validTypes.includes(tx.type))
        return res.status(400).json({
          success: false,
          message: `Invalid transaction type '${tx.type}' found.`,
          invalidTransaction: tx,
        });
      const parsedAmount = parseFloat(tx.amount);
      if (isNaN(parsedAmount))
        return res.status(400).json({
          success: false,
          message: 'Transaction amount must be a valid number.',
          invalidTransaction: tx,
        });

      transactionsToCreate.push({
        userId: req.user._id,
        date: new Date(tx.date),
        category: tx.category,
        // ENCRYPT before adding to the bulk array
        amount: encrypt(parsedAmount.toString()),
        type: tx.type,
        paymentMode: tx.paymentMode,
        shared: tx.shared || false,
        people: tx.people || 1,
        // ENCRYPT before adding to the bulk array (assuming amount is userShare for CSV)
        userShare: encrypt(parsedAmount.toString()),
        description: tx.description || '',
        isCredit: tx.type === 'credit' || tx.type === 'credit-repay',
      });
    }

    const createdTransactions = await Transaction.insertMany(transactionsToCreate);

    res.status(201).json({
      success: true,
      message: `${createdTransactions.length} transactions created successfully.`,
      data: createdTransactions.map(formatTransaction).filter(Boolean),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Server error during bulk import.', error: error.message });
  }
};
