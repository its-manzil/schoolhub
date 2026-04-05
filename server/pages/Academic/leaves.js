import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireAcademicOrSchoolAdmin } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Helper to get schoolId for user
const getSchoolId = async (db, user) => {
  if (user.role === 'schooladmin' || user.role === 'superadmin') {
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    return adminData?.schoolId;
  } else if (user.role === 'academic') {
    const academicData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    return academicData?.schoolId;
  }
  return null;
};

// Get all leave requests for a school
router.get('/', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    const leaves = await db.collection('leaves')
      .find({ schoolId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: leaves
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaves' });
  }
});

// Update leave status (approve/reject)
router.put('/:id', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { status, remarks } = req.body;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const result = await db.collection('leaves').updateOne(
      { _id: new ObjectId(id), schoolId },
      { 
        $set: { 
          status, 
          remarks: remarks || '',
          reviewedBy: req.user.id,
          reviewedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    res.json({ success: true, message: `Leave ${status} successfully` });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update leave status' });
  }
});

export default router;
