import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireSchoolAdmin } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get all exams for a school
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

    const exams = await db.collection('exams')
      .find({ schoolId: adminData.schoolId })
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
router.get('/:id', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const user = req.user;

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });

    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    const exam = await db.collection('exams').findOne({
      _id: new ObjectId(id),
      schoolId: adminData.schoolId
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
router.post('/', verifyToken, requireSchoolAdmin, async (req, res) => {
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
      schoolId: adminData.schoolId,
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
router.put('/:id', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updateData = req.body;
    const user = req.user;

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });

    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    const existingExam = await db.collection('exams').findOne({
      _id: new ObjectId(id),
      schoolId: adminData.schoolId
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
router.delete('/:id', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const user = req.user;

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });

    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    const result = await db.collection('exams').deleteOne({
      _id: new ObjectId(id),
      schoolId: adminData.schoolId
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
