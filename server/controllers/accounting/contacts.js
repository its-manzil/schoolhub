import { getDB } from '../../config/db.js';
import { ObjectId } from 'mongodb';

export const getContacts = async (req, res) => {
  try {
    const db = getDB();
    const { type } = req.query;
    const contacts = await db.collection('contacts').find(type ? { type } : {}).toArray();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createContact = async (req, res) => {
  try {
    const db = getDB();
    const newContact = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await db.collection('contacts').insertOne(newContact);
    res.status(201).json({ _id: result.insertedId, ...newContact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateContact = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updatedContact = await db.collection('contacts').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    res.status(200).json(updatedContact.value);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    await db.collection('contacts').deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
