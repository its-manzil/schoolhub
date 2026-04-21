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

// Get students for attendance
router.get('/students', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { className, section, date } = req.query;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!className || !section || !date) {
      return res.status(400).json({ success: false, message: 'Class, section, and date are required' });
    }

    // 1. Get all active students in that class/section
    const students = await db.collection('students')
      .find({ schoolId, className, section, isActive: true })
      .sort({ name: 1 })
      .toArray();

    // 2. Get existing attendance for that date
    const attendance = await db.collection('attendance')
      .find({ schoolId, className, section, date, type: 'student' })
      .toArray();

    // Map attendance to students
    const attendanceMap = {};
    attendance.forEach(record => {
      attendanceMap[record.studentId] = record.status;
    });

    const studentsWithAttendance = students.map(student => ({
      _id: student._id,
      studentId: student.studentId,
      name: student.name,
      rollNumber: student.rollNumber,
      status: attendanceMap[student.studentId] || 'present' // Default to present if not recorded
    }));

    res.json({
      success: true,
      data: studentsWithAttendance
    });
  } catch (error) {
    console.error('Get students for attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

// Save student attendance
router.post('/students', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { className, section, date, attendance } = req.body;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!className || !section || !date || !Array.isArray(attendance)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const bulkOps = attendance.map(record => ({
      updateOne: {
        filter: { 
          schoolId, 
          className, 
          section, 
          date, 
          studentId: record.studentId,
          type: 'student'
        },
        update: { 
          $set: { 
            status: record.status,
            updatedAt: new Date().toISOString()
          },
          $setOnInsert: {
            createdAt: new Date().toISOString()
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await db.collection('attendance').bulkWrite(bulkOps);
    }

    res.json({ success: true, message: 'Attendance saved successfully' });
  } catch (error) {
    console.error('Save student attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to save attendance' });
  }
});

// Get staff for attendance
router.get('/staff', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { date } = req.query;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const staff = await db.collection('teachers')
      .find({ schoolId, isActive: true })
      .sort({ name: 1 })
      .toArray();

    const attendance = await db.collection('attendance')
      .find({ schoolId, date, type: 'teacher' })
      .toArray();

    const attendanceMap = {};
    attendance.forEach(record => {
      attendanceMap[record.staffId] = record.status;
    });

    const staffWithAttendance = staff.map(member => ({
      _id: member._id,
      staffId: member.teacherId || member._id.toString(),
      name: member.name,
      designation: member.designation || 'Teacher',
      status: attendanceMap[member.teacherId || member._id.toString()] || 'present'
    }));

    res.json({
      success: true,
      data: staffWithAttendance
    });
  } catch (error) {
    console.error('Get staff for attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff' });
  }
});

// Save staff attendance
router.post('/staff', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { date, attendance } = req.body;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!date || !Array.isArray(attendance)) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const bulkOps = attendance.map(record => ({
      updateOne: {
        filter: { 
          schoolId, 
          date, 
          staffId: record.staffId,
          type: 'teacher'
        },
        update: { 
          $set: { 
            status: record.status,
            updatedAt: new Date().toISOString()
          },
          $setOnInsert: {
            createdAt: new Date().toISOString()
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await db.collection('attendance').bulkWrite(bulkOps);
    }

    res.json({ success: true, message: 'Staff attendance saved successfully' });
  } catch (error) {
    console.error('Save staff attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to save staff attendance' });
  }
});

// Get dashboard stats (student vs teacher attendance comparison)
router.get('/dashboard-stats', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { date, className, section } = req.query;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    // Student stats
    let studentQuery = { schoolId, isActive: true };
    if (className && section) {
      studentQuery = { ...studentQuery, className, section };
    }
    const students = await db.collection('students').find(studentQuery).toArray();
    
    let studentAttendanceQuery = { schoolId, date, type: 'student' };
    if (className && section) {
      studentAttendanceQuery = { ...studentAttendanceQuery, className, section };
    }
    const studentAttendance = await db.collection('attendance').find(studentAttendanceQuery).toArray();

    const studentStats = {
      total: students.length,
      present: studentAttendance.filter(a => a.status === 'present').length,
      absent: studentAttendance.filter(a => a.status === 'absent').length,
      late: studentAttendance.filter(a => a.status === 'late').length,
      percentage: students.length > 0 
        ? (studentAttendance.filter(a => a.status === 'present' || a.status === 'late').length / students.length) * 100 
        : 0
    };

    // Staff stats
    const staff = await db.collection('teachers').find({ schoolId, isActive: true }).toArray();
    const staffAttendance = await db.collection('attendance').find({ schoolId, date, type: 'teacher' }).toArray();

    const staffStats = {
      total: staff.length,
      present: staffAttendance.filter(a => a.status === 'present').length,
      absent: staffAttendance.filter(a => a.status === 'absent').length,
      late: staffAttendance.filter(a => a.status === 'late').length,
      percentage: staff.length > 0 
        ? (staffAttendance.filter(a => a.status === 'present' || a.status === 'late').length / staff.length) * 100 
        : 0
    };

    res.json({
      success: true,
      data: {
        student: studentStats,
        staff: staffStats
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
});

// Get monthly attendance summary for calendar heatmap
router.get('/monthly-summary', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { startDate, endDate, type, className, section } = req.query;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!startDate || !endDate || !type) {
      return res.status(400).json({ success: false, message: 'startDate, endDate, and type are required' });
    }

    // Build query
    let query = { 
      schoolId, 
      date: { $gte: startDate, $lte: endDate },
      type: type === 'student' ? 'student' : 'teacher'
    };
    
    if (type === 'student' && className && section) {
      query = { ...query, className, section };
    }

    const attendance = await db.collection('attendance').find(query).toArray();

    // Group by date
    const summary = {};
    attendance.forEach(record => {
      const date = record.date;
      if (!summary[date]) {
        summary[date] = { present: 0, absent: 0, late: 0, total: 0 };
      }
      summary[date][record.status]++;
      summary[date].total++;
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get monthly summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch monthly summary' });
  }
});

export default router;
