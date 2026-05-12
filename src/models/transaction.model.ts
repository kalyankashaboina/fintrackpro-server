import mongoose, { Schema, Model } from 'mongoose';
import { ITransaction, TransactionType } from '../types/transaction.types.js';

const TRANSACTION_TYPES: TransactionType[] = ['income', 'expense', 'borrow', 'repay', 'credit', 'credit-repay'];

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: { values: TRANSACTION_TYPES, message: 'Invalid transaction type' },
      required: [true, 'Transaction type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      index: true,
    },
    paymentMode: {
      type: String,
      trim: true,
      default: 'Cash',
    },
    isCredit: {
      type: Boolean,
      default: false,
      index: true,
    },
    shared: {
      type: Boolean,
      default: false,
    },
    people: {
      type: Number,
      default: 1,
      min: 1,
    },
    userShare: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, __v: _v, ...rest } = ret;
        return { id: _id.toString(), ...rest, userId: rest.userId?.toString() };
      },
    },
  }
);

// Pre-save: auto-compute userShare
transactionSchema.pre('save', function (next) {
  if (this.shared && this.people > 1) {
    this.userShare = this.amount / this.people;
  } else {
    this.userShare = this.amount;
  }
  // auto-set isCredit flag
  if (['credit', 'credit-repay'].includes(this.type)) {
    this.isCredit = true;
  }
  next();
});

// Performance indexes
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, isCredit: 1, date: -1 });
transactionSchema.index({ userId: 1, isCredit: 1, paymentMode: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ description: 'text', category: 'text', notes: 'text' });

const Transaction: Model<ITransaction> = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction;
