import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  merchant: string;
  amount: number;
  date: Date;
  account: string;
  category: string;
}

export interface IRule extends Document {
  conditions: {
    merchant?: string;
    dayOfWeek?: number; // 0 for Sunday, 6 for Saturday
    maxAmount?: number;
    account?: string;
  };
  newCategory: string;
}

const TransactionSchema: Schema = new Schema({
  merchant: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  account: { type: String, required: true },
  category: { type: String, required: true },
});

const RuleSchema: Schema = new Schema({
  conditions: {
    merchant: { type: String },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    maxAmount: { type: Number },
    account: { type: String },
  },
  newCategory: { type: String, required: true },
});

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
export const Rule = mongoose.model<IRule>('Rule', RuleSchema);