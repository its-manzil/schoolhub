import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireSchoolAdmin, requireAcademic } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';
import { hashPassword, comparePassword } from '../../utils/password.js';

const router = express.Router();

// Get academic account for a school
router.get('/', verifyToken, requireSchoolAdmin, async (req, res) => {
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

    const account = await db.collection('academics').findOne(
      { schoolId: adminData.schoolId },
      { projection: { password_hash: 0 } }
    );

    res.json({
      success: true,
      data: account || null
    });
  } catch (error) {
    console.error('Get academic account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch academic account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create academic account
router.post('/', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    const existingForSchool = await db.collection('academics').findOne({
      schoolId: adminData.schoolId
    });

    if (existingForSchool) {
      return res.status(400).json({
        success: false,
        message: 'Academic account already exists for this school'
      });
    }

    const existingUsername = await db.collection('academics').findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    const hashedPassword = await hashPassword(password);

    const academicAccount = {
      username,
      email: null,
      phone: null,
      role: 'academic',
      schoolId: adminData.schoolId,
      permissions: [],
      password_hash: hashedPassword,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };

    const result = await db.collection('academics').insertOne(academicAccount);

    const safeAccount = { ...academicAccount };
    delete safeAccount.password_hash;

    res.status(201).json({
      success: true,
      message: 'Academic account created successfully',
      data: { ...safeAccount, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Create academic account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create academic account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete academic account
router.delete('/', verifyToken, requireSchoolAdmin, async (req, res) => {
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

    const result = await db.collection('academics').deleteOne({
      schoolId: adminData.schoolId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Academic account not found for this school'
      });
    }

    res.json({
      success: true,
      message: 'Academic account deleted successfully'
    });
  } catch (error) {
    console.error('Delete academic account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete academic account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update academic password (by admin)
router.put('/password/admin', verifyToken, requireSchoolAdmin, async (req, res) => {
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

    const account = await db.collection('academics').findOne({
      schoolId: adminData.schoolId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Academic account not found for this school'
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.collection('academics').updateOne(
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
      message: 'Academic password updated successfully'
    });
  } catch (error) {
    console.error('Admin update academic password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update academic password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update password (self)
router.put('/password/self', verifyToken, requireAcademic, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new passwords are required'
      });
    }

    const account = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Academic account not found'
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

    await db.collection('academics').updateOne(
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
    console.error('Academic self update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
