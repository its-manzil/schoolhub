import { Schema, model, models } from 'mongoose';

const CoaSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Coa', default: null },
  code: { type: String },
});

const Coa = models.Coa || model('Coa', CoaSchema);

export default Coa;
