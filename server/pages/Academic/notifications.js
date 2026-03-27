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

// Send notification
router.post('/', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { title, message, target, className, section } = req.body;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!title || !message || !target) {
      return res.status(400).json({ success: false, message: 'Title, message, and target are required' });
    }

    const notification = {
      schoolId,
      title,
      message,
      target, // 'all', 'students', 'parents', 'staff', 'class'
      className: className || null,
      section: section || null,
      senderId: req.user.id,
      senderRole: req.user.role,
      createdAt: new Date().toISOString(),
      readBy: []
    };

    const result = await db.collection('notifications').insertOne(notification);

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: { ...notification, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to send notification' });
  }
});

// Get sent notifications
router.get('/', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    const notifications = await db.collection('notifications')
      .find({ schoolId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

export default router;
