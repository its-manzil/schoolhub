import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireSchoolAdmin } from '../../middleware/auth.js';

const router = express.Router();

// GET admin contacts for a school - from schools table
router.get('/:schoolId', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { schoolId } = req.params;
    const numericSchoolId = parseInt(schoolId);

    if (isNaN(numericSchoolId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid school ID'
      });
    }

    // Get admin contacts from schools table
    const school = await db.collection('schools').findOne(
      { schoolId: numericSchoolId },
      { projection: { 'adm-phone': 1, 'adm-email': 1, schoolId: 1 } }
    );

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    // Return admin contacts from schools table
    const adminContact = {
      schoolId: numericSchoolId,
      adminPhone: school['adm-phone'] || '',
      adminEmail: school['adm-email'] || '',
      createdAt: school.updatedAt || new Date()
    };

    res.json({
      success: true,
      data: adminContact
    });
  } catch (error) {
    console.error('Get admin contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// POST update admin contacts in schools table
router.post('/:schoolId', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { schoolId } = req.params;
    const { adminPhone, adminEmail } = req.body;
    const numericSchoolId = parseInt(schoolId);

    if (isNaN(numericSchoolId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid school ID'
      });
    }

    // Validate required fields
    if (!adminPhone || !adminEmail) {
      return res.status(400).json({
        success: false,
        message: 'Admin phone and email are required'
      });
    }

    // Update schools table with admin contacts
    const updateData = {
      'adm-phone': adminPhone.trim(),
      'adm-email': adminEmail.trim(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('schools').updateOne(
      { schoolId: numericSchoolId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    console.log(`Admin contacts updated for school ${numericSchoolId}`);

    res.status(200).json({
      success: true,
      message: 'Admin contacts saved successfully in schools table',
      data: {
        schoolId: numericSchoolId,
        adminPhone: adminPhone.trim(),
        adminEmail: adminEmail.trim(),
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Update admin contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
