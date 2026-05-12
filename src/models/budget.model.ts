import mongoose, { Schema, Model } from 'mongoose';
import { Types } from 'mongoose';

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export interface IBudget extends mongoose.Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  category: string;
  amount: number;
  period: BudgetPeriod;
  alertThreshold: number;
  currentSpent: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
      required: true,
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
    currentSpent: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ userId: 1, category: 1, period: 1 });
budgetSchema.index({ userId: 1, isActive: 1 });

const Budget: Model<IBudget> = mongoose.model<IBudget>('Budget', budgetSchema);

export default Budget;
