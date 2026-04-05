import mongoose from 'mongoose';

const TaxSchema = new mongoose.Schema({
  vatRate: { type: Number, default: 13 },
  tdsRules: [
    {
      category: { type: String, required: true },
      rate: { type: Number, required: true },
    },
  ],
});

export default mongoose.model('Tax', TaxSchema);
