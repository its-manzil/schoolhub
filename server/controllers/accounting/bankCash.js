import { getDB } from '../../config/db.js';
import { ObjectId } from 'mongodb';

export const getBankCashAccounts = async (req, res) => {
  try {
    const db = getDB();
    const accounts = await db.collection('bankcashes').find({}).toArray();
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBankCashAccount = async (req, res) => {
  try {
    const db = getDB();
    const newAccount = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('bankcashes').insertOne(newAccount);
    res.status(201).json({ _id: result.insertedId, ...newAccount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBankCashAccount = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updatedAccount = await db.collection('bankcashes').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    res.status(200).json(updatedAccount.value);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBankCashAccount = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    await db.collection('bankcashes').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
