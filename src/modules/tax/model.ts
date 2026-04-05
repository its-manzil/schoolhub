import { Schema, model, models } from 'mongoose';

const TaxSchema = new Schema({
  vatRate: { type: Number, default: 13 },
  tdsRules: [{ category: String, rate: Number }],
});

const Tax = models.Tax || model('Tax', TaxSchema);

export default Tax;
