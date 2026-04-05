import { getDB } from '../../config/db.js';
import { ObjectId } from 'mongodb';

export const getAccounts = async (req, res) => {
  try {
    const db = getDB();
    const accounts = await db.collection('chartofaccounts').find({}).toArray();
    
    // Simple transformation for hierarchical data
    const accountMap = {};
    const roots = [];
    for (const account of accounts) {
      accountMap[account._id.toString()] = { ...account, children: [] };
    }
    for (const account of accounts) {
      if (account.parentId) {
        accountMap[account.parentId.toString()].children.push(accountMap[account._id.toString()]);
      } else {
        roots.push(accountMap[account._id.toString()]);
      }
    }
    res.status(200).json(roots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAccount = async (req, res) => {
  try {
    const db = getDB();
    const newAccount = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('chartofaccounts').insertOne(newAccount);
    res.status(201).json({ _id: result.insertedId, ...newAccount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updatedAccount = await db.collection('chartofaccounts').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    res.status(200).json(updatedAccount.value);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    await db.collection('chartofaccounts').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
