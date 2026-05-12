import mongoose, { Schema, Model } from 'mongoose';
import { Types } from 'mongoose';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface IRecurringTransaction extends mongoose.Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  frequency: RecurringFrequency;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  lastProcessed?: Date;
  nextProcessDate: Date;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

const recurringTransactionSchema = new Schema<IRecurringTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastProcessed: {
      type: Date,
    },
    nextProcessDate: {
      type: Date,
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

recurringTransactionSchema.index({ userId: 1, isActive: 1 });
recurringTransactionSchema.index({ nextProcessDate: 1, isActive: 1 });

const RecurringTransaction: Model<IRecurringTransaction> = mongoose.model<IRecurringTransaction>(
  'RecurringTransaction',
  recurringTransactionSchema
);

export default RecurringTransaction;
