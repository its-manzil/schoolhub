import { Schema, model, models } from 'mongoose';

const BankCashSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  balance: { type: Number, default: 0 },
  accountNumber: { type: String },
});

const BankCash = models.BankCash || model('BankCash', BankCashSchema);

export default BankCash;
