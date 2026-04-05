import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  panVat: { type: String },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  logo: { type: String },
}, { timestamps: true });

export default mongoose.model('Organization', OrganizationSchema);
