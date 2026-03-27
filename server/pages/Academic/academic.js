import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireAcademicOrSchoolAdmin, requireAcademic } from '../../middleware/auth.js';
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

// Academic Dashboard: Get real data for KPI cards, analytics, etc.
router.get('/dashboard', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    let schoolId = null;
    if (user.role === 'schooladmin' || user.role === 'superadmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (adminData) schoolId = adminData.schoolId;
    } else if (user.role === 'academic') {
      const academicData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
      if (academicData) schoolId = academicData.schoolId;
    }

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School ID not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];

    // 1. Total Enrollment
    const totalStudents = await db.collection('students').countDocuments({ schoolId, isActive: true });
    const lastMonthStudents = await db.collection('students').countDocuments({
      schoolId,
      isActive: true,
      createdAt: { $lt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString() }
    });
    const studentTrend = lastMonthStudents > 0 ? (((totalStudents - lastMonthStudents) / lastMonthStudents) * 100).toFixed(1) : "0.0";

    // 2. Staff Present Today
    const totalTeachers = await db.collection('teachers').countDocuments({ schoolId, isActive: true });
    let teachersPresentToday = 0;
    try {
      teachersPresentToday = await db.collection('attendance').countDocuments({
        schoolId,
        date: today,
        status: 'present',
        type: 'teacher'
      });
    } catch {
      // Fallback
    }
    const staffPresenceRate = totalTeachers > 0 ? Math.round((teachersPresentToday / totalTeachers) * 100) : 0;

    // 3. Students Present Today
    let studentsPresentToday = 0;
    let studentsPresentYesterday = 0;
    try {
      studentsPresentToday = await db.collection('attendance').countDocuments({
        schoolId,
        date: today,
        status: 'present',
        type: 'student'
      });
      studentsPresentYesterday = await db.collection('attendance').countDocuments({
        schoolId,
        date: yesterday,
        status: 'present',
        type: 'student'
      });
    } catch {
      // Collection might not exist or connection error
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const studentAttendanceRate = totalStudents > 0 ? Math.round((studentsPresentToday / totalStudents) * 100) : 0;
    const attendanceTrendValue = studentsPresentYesterday > 0 ? (((studentsPresentToday - studentsPresentYesterday) / studentsPresentYesterday) * 100).toFixed(1) : "0.0";

    // 4. Upcoming Exams
    const now = new Date().toISOString();
    const upcomingExams = await db.collection('exams').find({
      schoolId,
      startDate: { $gte: now.split('T')[0] }
    }).sort({ startDate: 1 }).toArray();

    // 5. School Capacity (dynamic)
    const school = await db.collection('schools').findOne({ schoolId });
    const capacity = school?.capacity || 1000;
    const capacityPercentage = capacity > 0 ? Math.min(Math.round((totalStudents / capacity) * 100), 100) : 0;

    // 6. Class Distribution
    const classStats = await db.collection('students').aggregate([
      { $match: { schoolId, isActive: true } },
      { $group: { _id: "$className", students: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    const classDistribution = classStats.map(stat => ({
      name: `Class ${stat._id}`,
      students: stat.students
    }));

    // 7. Attendance Trend (Last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const attendanceChartData = [];
    try {
      for (const date of last7Days) {
        const count = await db.collection('attendance').countDocuments({
          schoolId,
          date,
          status: 'present',
          type: 'student'
        });
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        const percentage = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
        attendanceChartData.push({ name: dayName, attendance: percentage });
      }
    } catch {
      last7Days.forEach(date => {
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        attendanceChartData.push({ name: dayName, attendance: 0 });
      });
    }

    // 8. Recent Activity
    const recentStudents = await db.collection('students')
      .find({ schoolId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    const recentExams = await db.collection('exams')
      .find({ schoolId })
      .sort({ createdAt: -1 })
      .limit(2)
      .toArray();

    const recentTeachers = await db.collection('teachers')
      .find({ schoolId, isActive: true })
      .sort({ createdAt: -1 })
      .limit(2)
      .toArray();

    const recentActivity = [
      ...recentStudents.map(s => ({
        type: 'student',
        action: 'Student Added',
        desc: `${s.name} added to Class ${s.className}${s.section}`,
        time: s.createdAt,
        color: 'bg-indigo-500'
      })),
      ...recentExams.map(e => ({
        type: 'exam',
        action: 'Exam Created',
        desc: `${e.name} for Class ${e.className} created`,
        time: e.createdAt,
        color: 'bg-amber-500'
      })),
      ...recentTeachers.map(t => ({
        type: 'teacher',
        action: 'Teacher Joined',
        desc: `${t.name} joined the faculty`,
        time: t.createdAt,
        color: 'bg-emerald-500'
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // 9. Alerts
    const alerts = [];
    if (upcomingExams.length > 0) {
      const firstExam = upcomingExams[0];
      const examDate = new Date(firstExam.startDate);
      const diffDays = Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      if (diffDays <= 3 && diffDays >= 0) {
        alerts.push({
          type: 'urgent',
          title: 'Upcoming Exam',
          desc: `${firstExam.name} starts in ${diffDays} day(s).`,
          time: 'Action Required',
          href: '/Academic/Exams'
        });
      }
    }

    const endedExams = await db.collection('exams').find({
      schoolId,
      endDate: { $lt: now.split('T')[0] }
    }).sort({ endDate: -1 }).limit(3).toArray();

    endedExams.forEach(exam => {
      if (!exam.marks || exam.marks.length === 0) {
        alerts.push({
          type: 'urgent',
          title: 'Pending Marks Entry',
          desc: `Marks entry for ${exam.name} (Class ${exam.className}) is overdue.`,
          time: 'High Priority',
          href: `/Academic/Exams`
        });
      }
    });

    try {
      const pendingLeaves = await db.collection('leaves').countDocuments({ schoolId, status: 'pending' });
      if (pendingLeaves > 0) {
        alerts.push({
          type: 'pending',
          title: 'Leave Approvals',
          desc: `There are ${pendingLeaves} pending leave requests to review.`,
          time: 'Action Required',
          href: '/Academic/Leaves'
        });
      }
    } catch {
      // Collection might not exist
    }

    // 10. Pending Fees
    let pendingFeesCount = 0;
    try {
      pendingFeesCount = await db.collection('billings').countDocuments({
        schoolId,
        status: { $in: ['unpaid', 'partially_paid'] }
      });
    } catch {
      // Collection might not exist
    }

    // 11. Other Events (Meetings, Holidays, Notices)
    let otherEvents = [];
    try {
      const meetings = await db.collection('meetings').find({ schoolId, date: { $gte: today } }).toArray();
      const holidays = await db.collection('holidays').find({ schoolId, date: { $gte: today } }).toArray();
      const notices = await db.collection('notices').find({ schoolId, date: { $gte: today } }).toArray();

      otherEvents = [
        ...meetings.map(m => ({ date: m.date, title: m.title, type: 'meeting' })),
        ...holidays.map(h => ({ date: h.date, title: h.title, type: 'holiday' })),
        ...notices.map(n => ({ date: n.date, title: n.title, type: 'event' }))
      ];
    } catch {
      // Collections might not exist
    }

    const allEvents = [
      ...upcomingExams.map(e => ({ date: e.startDate, title: e.name, type: 'exam' })),
      ...otherEvents
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json({
      success: true,
      data: {
        kpis: {
          totalStudents,
          totalTeachers,
          studentsPresentToday,
          staffPresenceRate,
          upcomingExamsCount: upcomingExams.length,
          capacityPercentage,
          studentTrend: (parseFloat(studentTrend) >= 0 ? "+" : "") + studentTrend + "%",
          attendanceTrend: (parseFloat(attendanceTrendValue) >= 0 ? "+" : "") + attendanceTrendValue + "%",
          pendingFeesCount
        },
        analytics: {
          classDistribution,
          attendanceTrend: attendanceChartData
        },
        alerts,
        upcomingEvents: allEvents.slice(0, 5),
        recentActivity: recentActivity.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Academic dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
  }
});

export default router;
