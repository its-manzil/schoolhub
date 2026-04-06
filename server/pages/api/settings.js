import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get notification settings for user
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    let settings = await db.collection('notificationSettings').findOne({
      userId: user.id
    });

    // Return default settings if none exist
    if (!settings) {
      settings = {
        userId: user.id,
        emailAlerts: true,
        tdsReminders: true,
        voucherAlerts: false
      };
    }

    res.json({
      success: true,
      data: {
        emailAlerts: settings.emailAlerts || true,
        tdsReminders: settings.tdsReminders || true,
        voucherAlerts: settings.voucherAlerts || false
      }
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update notification settings
router.put('/notifications', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { emailAlerts, tdsReminders, voucherAlerts } = req.body;

    const settings = {
      userId: user.id,
      emailAlerts: emailAlerts !== undefined ? emailAlerts : true,
      tdsReminders: tdsReminders !== undefined ? tdsReminders : true,
      voucherAlerts: voucherAlerts !== undefined ? voucherAlerts : false,
      updatedAt: new Date().toISOString()
    };

    await db.collection('notificationSettings').updateOne(
      { userId: user.id },
      { $set: settings },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: {
        emailAlerts: settings.emailAlerts,
        tdsReminders: settings.tdsReminders,
        voucherAlerts: settings.voucherAlerts
      }
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification settings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Export accounting data
router.get('/export', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    let schoolId = null;
    if (user.role === 'schooladmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'accountant') {
      const accountantData = await db.collection('accountants').findOne({ _id: new ObjectId(user.id) });
      if (!accountantData || !accountantData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Accountant data not found'
        });
      }
      schoolId = accountantData.schoolId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized role for data export'
      });
    }

    // Get all accounting data for the school
    const vouchers = await db.collection('vouchers').find({ schoolId }).toArray();
    const transactions = await db.collection('transactions').find({ schoolId }).toArray();
    const tdsRecords = await db.collection('tds').find({ schoolId }).toArray();

    const exportData = {
      schoolId,
      exportDate: new Date().toISOString(),
      vouchers,
      transactions,
      tdsRecords
    };

    res.json({
      success: true,
      message: 'Data exported successfully',
      data: exportData
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create backup
router.post('/backup', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    let schoolId = null;
    if (user.role === 'schooladmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'accountant') {
      const accountantData = await db.collection('accountants').findOne({ _id: new ObjectId(user.id) });
      if (!accountantData || !accountantData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Accountant data not found'
        });
      }
      schoolId = accountantData.schoolId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized role for backup creation'
      });
    }

    // Create backup record
    const backup = {
      schoolId,
      backupDate: new Date().toISOString(),
      backupType: 'manual',
      status: 'completed',
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('backups').insertOne(backup);

    res.json({
      success: true,
      message: 'Backup created successfully',
      data: {
        backupId: result.insertedId,
        backupDate: backup.backupDate,
        status: backup.status
      }
    });
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create backup',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update fiscal year
router.put('/fiscal-year', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { fiscalYear } = req.body;

    if (!fiscalYear) {
      return res.status(400).json({
        success: false,
        message: 'Fiscal year is required'
      });
    }

    let schoolId = null;
    if (user.role === 'schooladmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'accountant') {
      const accountantData = await db.collection('accountants').findOne({ _id: new ObjectId(user.id) });
      if (!accountantData || !accountantData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Accountant data not found'
        });
      }
      schoolId = accountantData.schoolId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized role for fiscal year update'
      });
    }

    // Update fiscal year settings
    await db.collection('schoolSettings').updateOne(
      { schoolId },
      { 
        $set: { 
          fiscalYear,
          updatedAt: new Date().toISOString(),
          updatedBy: user.id
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Fiscal year updated successfully',
      data: { fiscalYear }
    });
  } catch (error) {
    console.error('Update fiscal year error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update fiscal year',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
