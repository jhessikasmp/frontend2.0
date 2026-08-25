import mongoose, { Document, Schema } from 'mongoose';
import { ExpenseCategory } from './Expense';

export interface IRecurringExpense extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  value: number;
  category: ExpenseCategory;
  description?: string;
  frequency: 'monthly' | 'bimonthly' | 'quarterly';
  startDate: Date;
  lastGenerated?: Date;
  active: boolean;
}

const RecurringExpenseSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  value: { type: Number, required: true },
  category: {
    type: String,
    enum: Object.values(ExpenseCategory),
    required: true
  },
  description: { type: String },
  frequency: {
    type: String,
    enum: ['monthly', 'bimonthly', 'quarterly'],
    required: true
  },
  startDate: { type: Date, required: true },
  lastGenerated: { type: Date },
  active: { type: Boolean, default: true },
});

export default mongoose.model<IRecurringExpense>('RecurringExpense', RecurringExpenseSchema);