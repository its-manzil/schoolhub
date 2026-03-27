import express from 'express';
import { getDB } from '../../config/db.js';
import { ObjectId } from 'mongodb';
import { verifyToken, requireSuperAdmin, requireSchoolAdmin, requireAccountant, requireTeacher, requireStudent, requireParent } from '../../middleware/auth.js';

const router = express.Router();

// Helper to get schoolId for user
const getSchoolId = async (db, user) => {
  if (user.role === 'schooladmin' || user.role === 'superadmin') {
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    return adminData?.schoolId;
  } else if (user.role === 'academic') {
    const academicData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    return academicData?.schoolId;
  } else if (user.role === 'accountant') {
    const accountantData = await db.collection('accountants').findOne({ _id: new ObjectId(user.id) });
    return accountantData?.schoolId;
  }
  return null;
};

// SuperAdmin Dashboard
router.get('/superadmin', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDB();
    const totalSchools = await db.collection('schools').countDocuments();
    const activeSubscriptions = await db.collection('schools').countDocuments({ 'subscription.status': 'active' });
    
    // Calculate total revenue (simplified)
    const schools = await db.collection('schools').find().toArray();
    const revenue = schools.reduce((acc, school) => acc + (school.subscription?.price || 0), 0);

    const recentSchools = await db.collection('schools')
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    res.json({ 
      success: true, 
      message: 'SuperAdmin dashboard data',
      data: {
        totalSchools,
        activeSubscriptions,
        revenue,
        recentActivity: recentSchools.map(s => ({
          action: 'New School Registered',
          desc: `${s.name} joined the platform`,
          time: s.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch SuperAdmin dashboard' });
  }
});

// SchoolAdmin Dashboard
router.get('/schooladmin', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) return res.status(404).json({ success: false, message: 'School not found' });

    const school = await db.collection('schools').findOne({ schoolId });
    const totalStudents = await db.collection('students').countDocuments({ schoolId, isActive: true });
    const totalTeachers = await db.collection('teachers').countDocuments({ schoolId, isActive: true });
    
    const today = new Date().toISOString().split('T')[0];
    const presentToday = await db.collection('attendance').countDocuments({ schoolId, date: today, status: 'present' });
    const attendancePercentage = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

    res.json({ 
      success: true, 
      message: 'SchoolAdmin dashboard data',
      data: {
        schoolName: school?.name || "My School",
        totalStudents,
        totalTeachers,
        attendance: attendancePercentage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch SchoolAdmin dashboard' });
  }
});

// Accountant Dashboard
router.get('/accountant', verifyToken, requireAccountant, async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);

    if (!schoolId) return res.status(404).json({ success: false, message: 'School not found' });

    const billings = await db.collection('billings').find({ schoolId }).toArray();
    const totalRevenue = billings.reduce((acc, b) => acc + (b.amountPaid || 0), 0);
    const pendingPayments = billings.reduce((acc, b) => acc + (b.status === 'unpaid' ? b.totalAmount : (b.status === 'partially_paid' ? b.totalAmount - b.amountPaid : 0)), 0);
    
    // Simplified expenses
    const expenses = 0; 

    res.json({ 
      success: true, 
      message: 'Accountant dashboard data',
      data: {
        totalRevenue,
        pendingPayments,
        expenses,
        financialReports: []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch Accountant dashboard' });
  }
});

// Teacher Dashboard
router.get('/teacher', verifyToken, requireTeacher, async (req, res) => {
  try {
    const db = getDB();
    // Simplified teacher dashboard
    res.json({ 
      success: true, 
      message: 'Teacher dashboard data',
      data: {
        myClasses: [],
        assignments: [],
        studentPerformance: []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch Teacher dashboard' });
  }
});

// Student Dashboard
router.get('/student', verifyToken, requireStudent, async (req, res) => {
  try {
    const db = getDB();
    // Simplified student dashboard
    res.json({ 
      success: true, 
      message: 'Student dashboard data',
      data: {
        myClasses: [],
        assignments: [],
        grades: [],
        attendance: []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch Student dashboard' });
  }
});

// Parent Dashboard
router.get('/parent', verifyToken, requireParent, async (req, res) => {
  try {
    const db = getDB();
    // Simplified parent dashboard
    res.json({ 
      success: true, 
      message: 'Parent dashboard data',
      data: {
        children: [],
        performance: [],
        attendance: [],
        fees: []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch Parent dashboard' });
  }
});

export default router;
