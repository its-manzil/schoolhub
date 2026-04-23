import { getDB } from '../../config/db.js';
import { ObjectId } from 'mongodb';

// Get all assets for a school
export const getAssets = async (req, res) => {
  try {
    const db = getDB();
    const schoolId = req.headers['x-school-id'] || req.query.schoolId;
    
    const query = schoolId ? { schoolId } : {};
    const assets = await db.collection('assets')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single asset by ID
export const getAssetById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    const asset = await db.collection('assets').findOne({ _id: new ObjectId(id) });
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    res.status(200).json(asset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new asset
export const createAsset = async (req, res) => {
  try {
    const db = getDB();
    const schoolId = req.headers['x-school-id'] || req.body.schoolId;
    
    const newAsset = {
      ...req.body,
      schoolId,
      status: req.body.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('assets').insertOne(newAsset);
    res.status(201).json({ _id: result.insertedId, ...newAsset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update asset
export const updateAsset = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    const updatedAsset = await db.collection('assets').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...req.body, 
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!updatedAsset.value && !updatedAsset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    res.status(200).json(updatedAsset.value || updatedAsset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sell asset (update status and add sale details)
export const sellAsset = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { salePrice, saleDate, buyer } = req.body;
    
    const updatedAsset = await db.collection('assets').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'sold',
          salePrice,
          saleDate: new Date(saleDate),
          buyer,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!updatedAsset.value && !updatedAsset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    res.status(200).json(updatedAsset.value || updatedAsset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark asset as destroyed
export const destroyAsset = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { destructionDate, reason } = req.body;
    
    const updatedAsset = await db.collection('assets').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'destroyed',
          destructionDate: new Date(destructionDate),
          destructionReason: reason,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    if (!updatedAsset.value && !updatedAsset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    res.status(200).json(updatedAsset.value || updatedAsset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get asset categories (distinct values)
export const getCategories = async (req, res) => {
  try {
    const db = getDB();
    const schoolId = req.headers['x-school-id'] || req.query.schoolId;
    
    const query = schoolId ? { schoolId } : {};
    const categories = await db.collection('assets').distinct('category', query);
    
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
