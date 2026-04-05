import { Schema, model, models } from 'mongoose';

const OrganizationSchema = new Schema({
  name: { type: String, required: true },
  panVat: { type: String },
  address: { type: String },
  phone: { type: String },
  email: { type: String },
  logo: { type: String },
});

const Organization = models.Organization || model('Organization', OrganizationSchema);

export default Organization;
