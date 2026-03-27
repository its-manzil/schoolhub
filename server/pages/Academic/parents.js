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

// Get parents with children details for a school
router.get('/', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    const schoolId = await getSchoolId(db, user);

    if (!schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School data not found'
      });
    }

    const parents = await db.collection('parents')
      .find({
        schoolId,
        isActive: { $ne: false }
      })
      .sort({ name: 1 })
      .toArray();

    const allStudentIds = parents
      .flatMap(parent => parent.children || [])
      .filter(id => typeof id === 'string' && id.trim().length > 0);

    const uniqueStudentIds = [...new Set(allStudentIds)];

    let studentsById = {};

    if (uniqueStudentIds.length > 0) {
      const students = await db.collection('students')
        .find({
          studentId: { $in: uniqueStudentIds },
          schoolId
        })
        .toArray();

      students.forEach(student => {
        const safeStudent = { ...student };
        delete safeStudent.password_hash;
        studentsById[student.studentId] = safeStudent;
      });
    }

    const parentsWithChildren = parents.map(parent => {
      const safeParent = { ...parent };
      delete safeParent.password_hash;
      const childrenDetails = (parent.children || [])
        .map(id => studentsById[id])
        .filter(child => !!child);

      return { ...safeParent, childrenDetails };
    });

    res.json({
      success: true,
      data: parentsWithChildren
    });
  } catch (error) {
    console.error('Get parents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parents',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
