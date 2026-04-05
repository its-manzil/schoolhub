import mongoose from 'mongoose';

const ChartOfAccountsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Asset', 'Liability', 'Income', 'Expense'], required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartOfAccounts', default: null },
  code: { type: String, unique: true, required: true },
}, { timestamps: true });

export default mongoose.model('ChartOfAccounts', ChartOfAccountsSchema);
