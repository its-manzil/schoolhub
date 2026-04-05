import mongoose from 'mongoose';

const FiscalYearSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('FiscalYear', FiscalYearSchema);
