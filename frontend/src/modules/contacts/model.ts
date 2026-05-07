import { Schema, model, models } from 'mongoose';

const ContactSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  phone: { type: String },
  pan: { type: String },
  openingBalance: { type: Number, default: 0 },
});

const Contact = models.Contact || model('Contact', ContactSchema);

export default Contact;
