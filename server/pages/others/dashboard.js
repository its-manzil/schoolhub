import express from 'express';
import { verifyToken, requireSuperAdmin, requireSchoolAdmin, requireAccountant, requireTeacher, requireStudent, requireParent } from '../../middleware/auth.js';

const router = express.Router();

// SuperAdmin Dashboard
router.get('/superadmin', verifyToken, requireSuperAdmin, (req, res) => {
  res.json({ 
    success: true, 
    message: 'SuperAdmin dashboard data',
    data: {
      totalSchools: 0,
      activeSubscriptions: 0,
      revenue: 0,
      recentActivity: []
    }
  });
});

// SchoolAdmin Dashboard
router.get('/schooladmin', verifyToken, requireSchoolAdmin, (req, res) => {
  res.json({ 
    success: true, 
    message: 'SchoolAdmin dashboard data',
    data: {
      schoolName: "Sample School",
      totalStudents: 0,
      totalTeachers: 0,
      attendance: 0
    }
  });
});

// Accountant Dashboard
router.get('/accountant', verifyToken, requireAccountant, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Accountant dashboard data',
    data: {
      totalRevenue: 0,
      pendingPayments: 0,
      expenses: 0,
      financialReports: []
    }
  });
});

// Teacher Dashboard
router.get('/teacher', verifyToken, requireTeacher, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Teacher dashboard data',
    data: {
      myClasses: [],
      assignments: [],
      studentPerformance: []
    }
  });
});

// Student Dashboard
router.get('/student', verifyToken, requireStudent, (req, res) => {
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
});

// Parent Dashboard
router.get('/parent', verifyToken, requireParent, (req, res) => {
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
});

export default router;
