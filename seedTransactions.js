// seedTransactions.js
require("dotenv").config();
const mongoose = require("mongoose");
const Transaction = require("./models/transactionModel");
const { mockTransactions } = require("./utils/mockTransactions");

const TEST_USER_ID = "68b1794c8e9176727b56b764"; 

const seedTransactions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Clear existing transactions
    await Transaction.deleteMany({});
    console.log("Existing transactions cleared");

    // Insert mock data
    const inserted = await Transaction.insertMany(
      mockTransactions.map((tx) => ({
        ...tx,
        date: new Date(tx.date),
        userId: new mongoose.Types.ObjectId(TEST_USER_ID), // ✅ must use 'new'
      }))
    );

    console.log(
      `${inserted.length} transactions inserted for user ID: ${TEST_USER_ID}`
    );
    process.exit();
  } catch (error) {
    console.error("Error seeding transactions:", error);
    process.exit(1);
  }
};

seedTransactions();
