import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireAcademicOrSchoolAdmin } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get all exams for a school
router.get('/', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    let userData;
    if (user.role === 'superadmin' || user.role === 'schooladmin') {
      userData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    } else if (user.role === 'academic') {
      userData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    }

    if (!userData || !userData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'User school data not found'
      });
    }

    const exams = await db.collection('exams')
      .find({ schoolId: userData.schoolId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: exams
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get exam by ID
router.get('/:id', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const user = req.user;

    let userData;
    if (user.role === 'superadmin' || user.role === 'schooladmin') {
      userData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    } else if (user.role === 'academic') {
      userData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    }

    if (!userData || !userData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'User school data not found'
      });
    }

    const exam = await db.collection('exams').findOne({
      _id: new ObjectId(id),
      schoolId: userData.schoolId
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new exam
router.post('/', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    let userData;
    if (user.role === 'superadmin' || user.role === 'schooladmin') {
      userData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    } else if (user.role === 'academic') {
      userData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    }

    if (!userData || !userData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'User school data not found'
      });
    }

    const {
      name,
      term,
      academicYear,
      className,
      startDate,
      endDate,
      routine
    } = req.body;

    if (!name || !term || !academicYear || !className) {
      return res.status(400).json({
        success: false,
        message: 'Name, term, academic year and class are required'
      });
    }

    const exam = {
      name,
      term,
      academicYear,
      className,
      startDate: startDate || null,
      endDate: endDate || null,
      routine: Array.isArray(routine) ? routine : [],
      marks: [],
      schoolId: userData.schoolId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('exams').insertOne(exam);

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: { ...exam, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create exam',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update exam
router.put('/:id', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updateData = req.body;
    const user = req.user;

    let userData;
    if (user.role === 'superadmin' || user.role === 'schooladmin') {
      userData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    } else if (user.role === 'academic') {
      userData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    }

    if (!userData || !userData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'User school data not found'
      });
    }

    const existingExam = await db.collection('exams').findOne({
      _id: new ObjectId(id),
      schoolId: userData.schoolId
    });

    if (!existingExam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    delete updateData.schoolId;
    delete updateData.createdAt;

    const result = await db.collection('exams').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    const updatedExam = await db.collection('exams').findOne({ _id: new ObjectId(id) });

    res.json({
      success: true,
      message: 'Exam updated successfully',
      data: updatedExam
    });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exam',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete exam
router.delete('/:id', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const user = req.user;

    let userData;
    if (user.role === 'superadmin' || user.role === 'schooladmin') {
      userData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    } else if (user.role === 'academic') {
      userData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    }

    if (!userData || !userData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'User school data not found'
      });
    }

    const result = await db.collection('exams').deleteOne({
      _id: new ObjectId(id),
      schoolId: userData.schoolId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exam',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
