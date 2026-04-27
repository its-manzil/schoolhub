import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken } from '../../middleware/auth.js';
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
  return user.schoolId || null;
};

// GET /api/staff/teachers - Get all teachers (role = "Teacher", status = "Active")
router.get('/teachers', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    const teachers = await db.collection('staff')
      .find({ 
        schoolId: schoolId,
        role: "Teacher",
        status: "Active"
      })
      .sort({ fullName: 1 })
      .toArray();

    const transformedTeachers = teachers.map(teacher => ({
      _id: teacher._id.toString(),
      staffId: teacher._id.toString(),
      fullName: teacher.fullName,
      email: teacher.email,
      phone: teacher.phone,
      department: teacher.department || '',
      designation: teacher.designation || 'Teacher'
    }));

    res.json({
      success: true,
      data: transformedTeachers
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch teachers' });
  }
});

// GET /api/attendance/daily?date=YYYY-MM-DD - Get existing daily attendance
router.get('/daily', verifyToken, async (req, res) => {
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

    // Find attendance record for this date
    const attendanceRecord = await db.collection('teacherAttendance').findOne({
      schoolId: schoolId,
      date: date,
      type: 'daily'
    });

    if (attendanceRecord) {
      return res.json({
        success: true,
        data: attendanceRecord,
        locked: attendanceRecord.locked || false
      });
    }

    res.json({
      success: true,
      data: null,
      locked: false
    });
  } catch (error) {
    console.error('Get daily attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
});

// POST /api/attendance/daily - Save daily attendance
router.post('/daily', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { date, attendance, isHoliday } = req.body;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    // Check if record already exists
    const existingRecord = await db.collection('teacherAttendance').findOne({
      schoolId: schoolId,
      date: date,
      type: 'daily'
    });

    if (existingRecord && existingRecord.locked) {
      return res.status(400).json({ 
        success: false, 
        message: 'Attendance already submitted and locked' 
      });
    }

    if (existingRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Attendance already submitted' 
      });
    }

    // Validate not a future date
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot mark attendance for future dates' 
      });
    }

    // Create attendance record with locked: true
    const attendanceRecord = {
      schoolId: schoolId,
      date: date,
      type: 'daily',
      isHoliday: isHoliday || false,
      attendance: attendance || [],
      locked: true,
      createdAt: new Date().toISOString(),
      createdBy: req.user.id
    };

    await db.collection('teacherAttendance').insertOne(attendanceRecord);

    res.json({ 
      success: true, 
      message: 'Attendance saved successfully',
      locked: true
    });
  } catch (error) {
    console.error('Save daily attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to save attendance' });
  }
});

// GET /api/attendance/monthly?yearBS=2080&monthBS=Baisakh - Get existing monthly attendance
router.get('/monthly', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { yearBS, monthBS } = req.query;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!yearBS || !monthBS) {
      return res.status(400).json({ success: false, message: 'Year and month are required' });
    }

    const attendanceRecord = await db.collection('teacherAttendance').findOne({
      schoolId: schoolId,
      yearBS: parseInt(yearBS),
      monthBS: monthBS,
      type: 'monthly'
    });

    if (attendanceRecord) {
      return res.json({
        success: true,
        data: attendanceRecord,
        locked: attendanceRecord.locked || false
      });
    }

    res.json({
      success: true,
      data: null,
      locked: false
    });
  } catch (error) {
    console.error('Get monthly attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch monthly attendance' });
  }
});

// POST /api/attendance/monthly - Save monthly attendance
router.post('/monthly', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const { yearBS, monthBS, totalHolidays, totalPresentDays } = req.body;
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    if (!yearBS || !monthBS) {
      return res.status(400).json({ success: false, message: 'Year and month are required' });
    }

    // Check for duplicate
    const existingRecord = await db.collection('teacherAttendance').findOne({
      schoolId: schoolId,
      yearBS: parseInt(yearBS),
      monthBS: monthBS,
      type: 'monthly'
    });

    if (existingRecord && existingRecord.locked) {
      return res.status(400).json({ 
        success: false, 
        message: 'Monthly attendance already submitted and locked' 
      });
    }

    if (existingRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Monthly attendance already submitted' 
      });
    }

    const attendanceRecord = {
      schoolId: schoolId,
      yearBS: parseInt(yearBS),
      monthBS: monthBS,
      type: 'monthly',
      totalHolidays: parseInt(totalHolidays) || 0,
      totalPresentDays: parseInt(totalPresentDays) || 0,
      locked: true,
      createdAt: new Date().toISOString(),
      createdBy: req.user.id
    };

    await db.collection('teacherAttendance').insertOne(attendanceRecord);

    res.json({ 
      success: true, 
      message: 'Monthly attendance saved successfully',
      locked: true
    });
  } catch (error) {
    console.error('Save monthly attendance error:', error);
    res.status(500).json({ success: false, message: 'Failed to save monthly attendance' });
  }
});

export default router;
