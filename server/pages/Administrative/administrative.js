import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireSchoolAdmin } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';
import { hashPassword, comparePassword } from '../../utils/password.js';

const router = express.Router();

// Get administrative account for a school
router.get('/administrative', verifyToken, requireSchoolAdmin, async (req, res) => {
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

    const administrative = await db.collection('administratives').findOne(
      { schoolId: adminData.schoolId },
      { projection: { password_hash: 0 } }
    );

    res.json({
      success: true,
      data: administrative || null,
      schoolId: adminData.schoolId
    });
  } catch (error) {
    console.error('Get administrative account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch administrative account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create administrative user
router.post('/create-administrative', verifyToken, requireSchoolAdmin, async (req, res) => {
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

    // Check if administrative already exists for this school
    const existingForSchool = await db.collection('administratives').findOne({
      schoolId: adminData.schoolId
    });

    if (existingForSchool) {
      return res.status(400).json({
        success: false,
        message: 'Administrative account already exists for this school'
      });
    }

    // Generate username in correct format: adm_schoolId
    const username = `adm_${adminData.schoolId}`;

    // Check if username already exists (shouldn't happen with our format, but safety check)
    const existingUsername = await db.collection('administratives').findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    const hashedPassword = await hashPassword(password);

    const administrativeAccount = {
      username,
      role: 'administrative',
      schoolId: adminData.schoolId,
      permissions: [],
      password_hash: hashedPassword,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };

    const result = await db.collection('administratives').insertOne(administrativeAccount);

    const safeAccount = { ...administrativeAccount };
    delete safeAccount.password_hash;

    res.status(201).json({
      success: true,
      message: 'Administrative account created successfully',
      data: { ...safeAccount, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Create administrative account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create administrative account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete administrative account (requires admin password verification)
router.delete('/delete-administrative', verifyToken, requireSchoolAdmin, async (req, res) => {
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

    const result = await db.collection('administratives').deleteOne({
      schoolId: adminData.schoolId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Administrative account not found for this school'
      });
    }

    res.json({
      success: true,
      message: 'Administrative account deleted successfully'
    });
  } catch (error) {
    console.error('Delete administrative account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete administrative account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Change administrative password (admin can change without current password)
router.put('/change-administrative-password', verifyToken, requireSchoolAdmin, async (req, res) => {
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

    const administrative = await db.collection('administratives').findOne({
      schoolId: adminData.schoolId
    });

    if (!administrative) {
      return res.status(404).json({
        success: false,
        message: 'Administrative account not found for this school'
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.collection('administratives').updateOne(
      { _id: administrative._id },
      {
        $set: {
          password_hash: hashedPassword,
          updatedAt: new Date().toISOString()
        }
      }
    );

    res.json({
      success: true,
      message: 'Administrative password updated successfully'
    });
  } catch (error) {
    console.error('Change administrative password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update administrative password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
