import { getDB } from '../../config/db.js';

// Voucher number generator
export const generateVoucherNumber = async (type) => {
  const db = getDB();
  const fiscalYear = "2082";
  
  const collection = db.collection("voucherSequences");
  const sequence = await collection.findOneAndUpdate(
    { type, fiscalYear },
    { $inc: { sequence: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  
  const sequenceNumber = sequence.sequence.toString().padStart(4, "0");
  return `${type}-${fiscalYear}-${sequenceNumber}`;
};
