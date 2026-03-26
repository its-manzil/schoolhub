import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireSchoolAdmin, requireAcademicOrSchoolAdmin, requireAcademic } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';
import { hashPassword, comparePassword } from '../../utils/password.js';

const router = express.Router();

// Academic view: get students for school admins and academic users
router.get('/students', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    let schoolId = null;

    if (user.role === 'schooladmin' || user.role === 'superadmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'academic') {
      const academicData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
      if (!academicData || !academicData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Academic user data not found'
        });
      }
      schoolId = academicData.schoolId;
    }

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID not found for user'
      });
    }

    const students = await db.collection('students')
      .find({
        schoolId,
        isActive: { $ne: false }
      })
      .sort({ name: 1 })
      .toArray();

    const safeStudents = students.map(student => {
      const safeStudent = { ...student };
      delete safeStudent.password_hash;
      return safeStudent;
    });

    res.json({
      success: true,
      data: safeStudents
    });
  } catch (error) {
    console.error('Academic get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Academic view: get parents with children details for academic users and school admins
router.get('/parents', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    let schoolId = null;

    if (user.role === 'schooladmin' || user.role === 'superadmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'academic') {
      const academicData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
      if (!academicData || !academicData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Academic user data not found'
        });
      }
      schoolId = academicData.schoolId;
    }

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID not found for user'
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
    console.error('Academic get parents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parents',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get subject routines
router.get('/subjects/routines', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { className, academicYearBs } = req.query;

    if (!className) {
      return res.status(400).json({
        success: false,
        message: 'Class name is required'
      });
    }

    let schoolId = null;

    if (user.role === 'schooladmin' || user.role === 'superadmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'academic') {
      const academicData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
      if (!academicData || !academicData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Academic user data not found'
        });
      }
      schoolId = academicData.schoolId;
    }

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID not found for user'
      });
    }

    const query = {
      schoolId,
      className
    };

    if (academicYearBs) {
      query.academicYearBs = academicYearBs;
    }

    const routines = await db.collection('subjectroutines')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    if (routines.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: routines[0]
    });
  } catch (error) {
    console.error('Academic get subject routines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject routines',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Save subject routine
router.post('/subjects/routines', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { className, academicYearBs, effectiveFromBs, periods } = req.body;

    if (!className || !academicYearBs) {
      return res.status(400).json({
        success: false,
        message: 'Class name and academic year (B.S.) are required'
      });
    }

    if (!Array.isArray(periods)) {
      return res.status(400).json({
        success: false,
        message: 'Periods must be an array'
      });
    }

    let schoolId = null;

    if (user.role === 'schooladmin' || user.role === 'superadmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'academic') {
      const academicData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
      if (!academicData || !academicData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Academic user data not found'
        });
      }
      schoolId = academicData.schoolId;
    }

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID not found for user'
      });
    }

    const nowIso = new Date().toISOString();

    const update = {
      schoolId,
      className,
      academicYearBs,
      effectiveFromBs: effectiveFromBs || null,
      periods,
      updatedAt: nowIso
    };

    const result = await db.collection('subjectroutines').updateOne(
      { schoolId, className, academicYearBs },
      {
        $set: update,
        $setOnInsert: {
          createdAt: nowIso
        }
      },
      { upsert: true }
    );

    const routine = await db.collection('subjectroutines').findOne({
      schoolId,
      className,
      academicYearBs
    });

    res.status(result.upsertedCount > 0 ? 201 : 200).json({
      success: true,
      message: 'Subject routine saved successfully',
      data: routine
    });
  } catch (error) {
    console.error('Academic save subject routines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save subject routines',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Academic view: get exams for academic users and school admins
router.get('/exams', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    let schoolId = null;

    if (user.role === 'schooladmin' || user.role === 'superadmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'academic') {
      const academicData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
      if (!academicData || !academicData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Academic user data not found'
        });
      }
      schoolId = academicData.schoolId;
    }

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID not found for user'
      });
    }

    const exams = await db.collection('exams')
      .find({ schoolId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: exams
    });
  } catch (error) {
    console.error('Academic get exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exams',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Academic view: create exams for academic users and school admins
router.post('/exams', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    let schoolId = null;

    if (user.role === 'schooladmin' || user.role === 'superadmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'academic') {
      const academicData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
      if (!academicData || !academicData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Academic user data not found'
        });
      }
      schoolId = academicData.schoolId;
    }

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID not found for user'
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
      schoolId,
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
    console.error('Academic create exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create exam',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Academic view: update exams for academic users and school admins
router.put('/exams/:id', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updateData = req.body;
    const user = req.user;

    let schoolId = null;

    if (user.role === 'schooladmin' || user.role === 'superadmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'academic') {
      const academicData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
      if (!academicData || !academicData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Academic user data not found'
        });
      }
      schoolId = academicData.schoolId;
    }

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID not found for user'
      });
    }

    delete updateData.schoolId;
    delete updateData.createdAt;

    const existingExam = await db.collection('exams').findOne({
      _id: new ObjectId(id),
      schoolId
    });

    if (!existingExam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

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
    console.error('Academic update exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exam',
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
