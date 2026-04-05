import mongoose from 'mongoose';

const BankCashSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Bank', 'Cash'], required: true },
  balance: { type: Number, default: 0 },
  accountNumber: { type: String },
}, { timestamps: true });

export default mongoose.model('BankCash', BankCashSchema);
