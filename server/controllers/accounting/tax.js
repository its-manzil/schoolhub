import { getDB } from '../../config/db.js';
import { ObjectId } from 'mongodb';

// Helper to get schoolId for user
const getSchoolId = async (db, user) => {
  if (user.role === 'schooladmin' || user.role === 'superadmin') {
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    return adminData?.schoolId;
  } else if (user.role === 'accountant') {
    const accountantData = await db.collection('accountants').findOne({ _id: new ObjectId(user.id) });
    return accountantData?.schoolId;
  } else if (user.role === 'academic') {
    const academicData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    return academicData?.schoolId;
  }
  return null;
};

export const getTaxSettings = async (req, res) => {
  try {
    const db = getDB();
    
    // Get schoolId from authenticated user
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({ success: false, error: 'Unauthorized - School ID not found' });
    }
    
    console.log('Fetching tax settings for schoolId:', schoolId);
    
    // Find tax settings for the specific school
    const settings = await db.collection('tax_settings').findOne({ schoolId: schoolId });
    
    // Return default values if no settings found
    const defaultSettings = {
      vatRate: 0,
      taxRules: []
    };
    
    console.log('Tax settings found:', settings ? 'Yes' : 'No, using defaults');
    
    res.status(200).json({
      success: true,
      data: settings || defaultSettings
    });
  } catch (error) {
    console.error('Get tax settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const saveTaxSettings = async (req, res) => {
  try {
    const db = getDB();
    
    // Get schoolId from authenticated user
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({ success: false, error: 'Unauthorized - School ID not found' });
    }
    
    const { vatRate, taxRules } = req.body;
    
    console.log('Saving tax settings for schoolId:', schoolId);
    console.log('Data:', { vatRate, taxRules });
    
    // Validate VAT rate
    if (typeof vatRate !== 'number' || vatRate < 0 || vatRate > 100) {
      return res.status(400).json({ 
        success: false, 
        error: 'VAT rate must be a number between 0 and 100' 
      });
    }
    
    // Validate tax rules array
    if (!Array.isArray(taxRules)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tax rules must be an array' 
      });
    }
    
    // Validate each tax rule
    for (const rule of taxRules) {
      // Required fields
      if (!rule.name || typeof rule.name !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Each tax rule must have a name' 
        });
      }
      
      if (!rule.category || typeof rule.category !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Each tax rule must have a category' 
        });
      }
      
      if (!rule.type || !['FIXED', 'SLAB', 'FINAL'].includes(rule.type)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Each tax rule must have a valid type (FIXED, SLAB, or FINAL)' 
        });
      }
      
      if (!rule.revenueCode || typeof rule.revenueCode !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Each tax rule must have a revenue code' 
        });
      }
      
      // Type-specific validation
      if (rule.type === 'FIXED' || rule.type === 'FINAL') {
        if (typeof rule.rate !== 'number' || rule.rate < 0 || rule.rate > 100) {
          return res.status(400).json({ 
            success: false, 
            error: `${rule.type} tax rules must have a rate between 0 and 100` 
          });
        }
      }
      
      if (rule.type === 'SLAB') {
        if (!Array.isArray(rule.slabs) || rule.slabs.length === 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'SLAB tax rules must have at least one slab' 
          });
        }
        
        // Validate each slab
        for (const slab of rule.slabs) {
          if (typeof slab.from !== 'number' || slab.from < 0) {
            return res.status(400).json({ 
              success: false, 
              error: 'Each slab must have a valid "from" amount (>= 0)' 
            });
          }
          
          if (slab.to !== undefined && (typeof slab.to !== 'number' || slab.to < 0)) {
            return res.status(400).json({ 
              success: false, 
              error: 'Each slab "to" amount must be a valid number (>= 0)' 
            });
          }
          
          if (typeof slab.rate !== 'number' || slab.rate < 0 || slab.rate > 100) {
            return res.status(400).json({ 
              success: false, 
              error: 'Each slab must have a rate between 0 and 100' 
            });
          }
        }
      }
      
      // Validate threshold if present
      if (rule.threshold) {
        if (rule.threshold.individual !== undefined) {
          if (typeof rule.threshold.individual !== 'number' || rule.threshold.individual < 0) {
            return res.status(400).json({ 
              success: false, 
              error: 'Individual threshold must be a number >= 0' 
            });
          }
        }
        
        if (rule.threshold.couple !== undefined) {
          if (typeof rule.threshold.couple !== 'number' || rule.threshold.couple < 0) {
            return res.status(400).json({ 
              success: false, 
              error: 'Couple threshold must be a number >= 0' 
            });
          }
        }
      }
    }
    
    // Upsert the tax settings
    const result = await db.collection('tax_settings').updateOne(
      { schoolId: schoolId },
      { 
        $set: {
          vatRate: vatRate,
          taxRules: taxRules,
          updatedAt: new Date()
        },
        $setOnInsert: {
          schoolId: schoolId,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    // Create index for performance
    await db.collection('tax_settings').createIndex({ schoolId: 1 });
    
    console.log('Tax settings saved:', result.matchedCount ? 'Updated' : 'Created');
    
    // Return the updated settings
    const savedSettings = await db.collection('tax_settings').findOne({ schoolId: schoolId });
    
    res.status(200).json({
      success: true,
      data: savedSettings
    });
  } catch (error) {
    console.error('Save tax settings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
