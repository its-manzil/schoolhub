import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireSchoolAdmin } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';
import { hashPassword, comparePassword } from '../../utils/password.js';
import administrativeRoutes from '../Administrative/administrative.js';

const router = express.Router();

// Get accountant account for a school
router.get('/accountant', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    const accountant = await db.collection('accountants').findOne(
      { schoolId: adminData.schoolId },
      { projection: { password_hash: 0 } }
    );

    res.json({
      success: true,
      data: accountant || null,
      schoolId: adminData.schoolId
    });
  } catch (error) {
    console.error('Get accountant account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accountant account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create accountant user
router.post('/create', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    // Check if accountant already exists for this school
    const existingForSchool = await db.collection('accountants').findOne({
      schoolId: adminData.schoolId
    });

    if (existingForSchool) {
      return res.status(400).json({
        success: false,
        message: 'Accountant account already exists for this school'
      });
    }

    // Generate username in correct format: acct_schoolId
    const username = `acct_${adminData.schoolId}`;

    // Check if username already exists (shouldn't happen with our format, but safety check)
    const existingUsername = await db.collection('accountants').findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    const hashedPassword = await hashPassword(password);

    const accountantAccount = {
      username,
      role: 'accountant',
      schoolId: adminData.schoolId,
      permissions: [],
      password_hash: hashedPassword,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };

    const result = await db.collection('accountants').insertOne(accountantAccount);

    const safeAccount = { ...accountantAccount };
    delete safeAccount.password_hash;

    res.status(201).json({
      success: true,
      message: 'Accountant account created successfully',
      data: { ...safeAccount, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Create accountant account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create accountant account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Change password (for logged in user)
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    let account = null;
    let collection = '';

    // Determine user collection based on role
    switch (user.role) {
      case 'schooladmin':
        collection = 'schooladmins';
        break;
      case 'accountant':
        collection = 'accountants';
        break;
      case 'academic':
        collection = 'academics';
        break;
      case 'billing':
        collection = 'billings';
        break;
      default:
        return res.status(403).json({
          success: false,
          message: 'Unauthorized role for password change'
        });
    }

    account = await db.collection(collection).findOne({ _id: new ObjectId(user.id) });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    const isMatch = await comparePassword(currentPassword, account.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.collection(collection).updateOne(
      { _id: account._id },
      {
        $set: {
          password_hash: hashedPassword,
          updatedAt: new Date().toISOString()
        }
      }
    );

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete accountant account (requires admin password verification)
router.delete('/delete-accountant', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { adminPassword } = req.body;

    if (!adminPassword) {
      return res.status(400).json({
        success: false,
        message: 'Admin password is required'
      });
    }

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    // Verify admin password
    const isMatch = await comparePassword(adminPassword, adminData.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin password'
      });
    }

    const result = await db.collection('accountants').deleteOne({
      schoolId: adminData.schoolId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Accountant account not found for this school'
      });
    }

    res.json({
      success: true,
      message: 'Accountant account deleted successfully'
    });
  } catch (error) {
    console.error('Delete accountant account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete accountant account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Change accountant password (admin can change without current password)
router.put('/change-accountant-password', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    const accountant = await db.collection('accountants').findOne({
      schoolId: adminData.schoolId
    });

    if (!accountant) {
      return res.status(404).json({
        success: false,
        message: 'Accountant account not found for this school'
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.collection('accountants').updateOne(
      { _id: accountant._id },
      {
        $set: {
          password_hash: hashedPassword,
          updatedAt: new Date().toISOString()
        }
      }
    );

    res.json({
      success: true,
      message: 'Accountant password updated successfully'
    });
  } catch (error) {
    console.error('Change accountant password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update accountant password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ===================== BILLING ACCOUNT ENDPOINTS =====================

// Get billing account for a school
router.get('/billing', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    const billing = await db.collection('billings').findOne(
      { schoolId: adminData.schoolId },
      { projection: { password_hash: 0 } }
    );

    res.json({
      success: true,
      data: billing || null,
      schoolId: adminData.schoolId
    });
  } catch (error) {
    console.error('Get billing account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create billing user
router.post('/create-billing', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { username, password, role, schoolId } = req.body;

    if (!password || !role || !schoolId) {
      return res.status(400).json({
        success: false,
        message: 'Password, role, and schoolId are required'
      });
    }

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    // Verify the schoolId matches the admin's school
    if (schoolId !== adminData.schoolId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to create billing account for this school'
      });
    }

    // Check if billing already exists for this school
    const existingForSchool = await db.collection('billings').findOne({
      schoolId: adminData.schoolId
    });

    if (existingForSchool) {
      return res.status(400).json({
        success: false,
        message: 'Billing account already exists for this school'
      });
    }

    // Generate username if not provided: bill_schoolId
    const generatedUsername = username || `bill_${adminData.schoolId}`;

    // Check if username already exists
    const existingUsername = await db.collection('billings').findOne({ username: generatedUsername });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    const hashedPassword = await hashPassword(password);

    const billingAccount = {
      username: generatedUsername,
      role: 'billing',
      schoolId: adminData.schoolId,
      permissions: [
        'manage_students',
        'view_reports',
        'manage_school_settings'
      ],
      password_hash: hashedPassword,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };

    const result = await db.collection('billings').insertOne(billingAccount);

    const safeAccount = { ...billingAccount };
    delete safeAccount.password_hash;

    res.status(201).json({
      success: true,
      message: 'Billing account created successfully',
      data: { ...safeAccount, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Create billing account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create billing account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete billing account (requires admin password verification)
router.delete('/delete-billing', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { adminPassword } = req.body;

    if (!adminPassword) {
      return res.status(400).json({
        success: false,
        message: 'Admin password is required'
      });
    }

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    // Verify admin password
    const isMatch = await comparePassword(adminPassword, adminData.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin password'
      });
    }

    const result = await db.collection('billings').deleteOne({
      schoolId: adminData.schoolId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Billing account not found for this school'
      });
    }

    res.json({
      success: true,
      message: 'Billing account deleted successfully'
    });
  } catch (error) {
    console.error('Delete billing account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete billing account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Change billing password (admin can change without current password)
router.put('/change-billing-password', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    const billing = await db.collection('billings').findOne({
      schoolId: adminData.schoolId
    });

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'Billing account not found for this school'
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.collection('billings').updateOne(
      { _id: billing._id },
      {
        $set: {
          password_hash: hashedPassword,
          updatedAt: new Date().toISOString()
        }
      }
    );

    res.json({
      success: true,
      message: 'Billing password updated successfully'
    });
  } catch (error) {
    console.error('Change billing password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update billing password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Use administrative routes
router.use('/', administrativeRoutes);

export default router;
