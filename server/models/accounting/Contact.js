import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Customer', 'Vendor'], required: true },
  phone: { type: String },
  pan: { type: String },
  openingBalance: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Contact', ContactSchema);
