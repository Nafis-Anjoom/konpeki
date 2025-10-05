
import mongoose, { Schema, Document } from 'mongoose';

// Interface for Transaction
export interface ITransaction extends Document {
  merchant: string;
  amount: number;
  date: Date;
  account: string;
  category: string;
}

// Interface for Rule
export interface IRule extends Document {
  conditions: {
    merchant?: string;
    dayOfWeek?: number; // 0 for Sunday, 1 for Monday, etc.
    maxAmount?: number;
    account?: string;
  };
  newCategory: string;
}

// Transaction Schema
const TransactionSchema: Schema = new Schema({
  merchant: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  account: { type: String, required: true },
  category: { type: String, required: true, default: 'Uncategorized' },
});

// Rule Schema
const RuleSchema: Schema = new Schema({
  conditions: {
    merchant: { type: String },
    dayOfWeek: { type: Number },
    maxAmount: { type: Number },
    account: { type: String },
  },
  newCategory: { type: String, required: true },
});

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
export const Rule = mongoose.model<IRule>('Rule', RuleSchema);
