import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireSuperAdmin } from '../../middleware/auth.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// GET pricing configuration
router.get('/pricing', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDB();
    let pricing = await db.collection('superadmin_settings').findOne({ type: 'school_pricing' });
    
    // If no pricing config exists, create default
    if (!pricing) {
      const defaultPricing = {
        type: 'school_pricing',
        rates: {
          monthly: 2000,
          yearly: 20000,
          perStudent: 50
        },
        currency: 'NPR',
        updatedAt: new Date().toISOString()
      };
      await db.collection('superadmin_settings').insertOne(defaultPricing);
      pricing = defaultPricing;
    }
    
    res.json({ 
      success: true, 
      data: {
        rates: pricing.rates,
        currency: pricing.currency,
        updatedAt: pricing.updatedAt
      }
    });
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pricing configuration' });
  }
});

// UPDATE pricing configuration
router.put('/pricing', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { monthly, yearly, perStudent, currency } = req.body;
    
    // Validate required fields
    if (monthly === undefined || yearly === undefined || perStudent === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Monthly, yearly, and perStudent rates are required' 
      });
    }
    
    // Validate numeric values
    if (monthly < 0 || yearly < 0 || perStudent < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rates must be positive numbers' 
      });
    }
    
    const updateData = {
      type: 'school_pricing',
      rates: {
        monthly: parseFloat(monthly),
        yearly: parseFloat(yearly),
        perStudent: parseFloat(perStudent)
      },
      currency: currency || 'NPR',
      updatedAt: new Date().toISOString()
    };
    
    // Upsert pricing configuration
    await db.collection('superadmin_settings').updateOne(
      { type: 'school_pricing' },
      { $set: updateData },
      { upsert: true }
    );
    
    res.json({ 
      success: true, 
      message: 'Pricing configuration updated successfully',
      data: {
        rates: updateData.rates,
        currency: updateData.currency,
        updatedAt: updateData.updatedAt
      }
    });
  } catch (error) {
    console.error('Update pricing error:', error);
    res.status(500).json({ success: false, message: 'Failed to update pricing configuration' });
  }
});

// Change password
router.put('/change-password', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    const user = await db.collection('superadmins').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await comparePassword(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid current password' });
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.collection('superadmins').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password_hash: hashedPassword, updatedAt: new Date().toISOString() } }
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

export default router;
