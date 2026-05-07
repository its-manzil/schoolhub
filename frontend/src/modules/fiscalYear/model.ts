import { Schema, model, models } from 'mongoose';

const FiscalYearSchema = new Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
});

const FiscalYear = models.FiscalYear || model('FiscalYear', FiscalYearSchema);

export default FiscalYear;
