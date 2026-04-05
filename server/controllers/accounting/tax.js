import { getDB } from '../../config/db.js';

export const getTaxSettings = async (req, res) => {
  try {
    const db = getDB();
    const settings = await db.collection('taxes').findOne();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveTaxSettings = async (req, res) => {
  try {
    const db = getDB();
    const settings = await db.collection('taxes').findOneAndUpdate(
      {},
      { $set: { ...req.body, updatedAt: new Date() } },
      { returnDocument: 'after', upsert: true }
    );
    res.status(200).json(settings.value);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
