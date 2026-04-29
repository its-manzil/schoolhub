import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import { connectToMongoDB } from './config/db.js';

// Section imports (from pages folder)
import authRoutes from './pages/others/auth.js';
import dashboardRoutes from './pages/others/dashboard.js';
import schoolRoutes from './pages/SuperAdmin/schools.js';
import teacherRoutes from './pages/Academic/teachers.js';
import studentRoutes from './pages/Academic/students.js';
import academicRoutes from './pages/Academic/academic.js';
import examRoutes from './pages/Academic/exams.js';
import parentRoutes from './pages/Academic/parents.js';
import attendanceRoutes from './pages/Academic/attendance.js';
import notificationRoutes from './pages/Academic/notifications.js';
import leaveRoutes from './pages/Academic/leaves.js';
import billingRoutes from './pages/Accounting/billings.js';
import academicAccountRoutes from './pages/SchoolAdmin/academic-account.js';
import superAdminSettingsRoutes from './pages/SuperAdmin/settings.js';
import superAdminAdminsRoutes from './pages/SuperAdmin/admins.js';
import importRoutes from './pages/SuperAdmin/import.js';
import accountingRoutes from './routes/accounting/index.js';
import billingGenRoutes from './routes/billing/index.js';
import staffRoutes from './routes/administrative/staff.js';
import adminAttendanceRoutes from './routes/administrative/attendance.js';
import adminContactsRoutes from './pages/Administrative/adminContacts.js';
import usersRoutes from './pages/api/users.js';
import settingsRoutes from './pages/api/settings.js';

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();

console.log('!!! SERVER.JS STARTING - Debug version !!!');

// Connect to MongoDB
connectToMongoDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Global request logging for debugging
app.use((req, res, next) => {
  if (req.originalUrl.includes('/api/accounting')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-school-id'],
  credentials: true,
  exposedHeaders: ['Set-Cookie']
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', database: 'SchoolHub' });
});

// Debug test endpoint for recent vouchers
app.get('/api/test-vouchers', async (req, res) => {
  try {
    const { connectToDatabase } = await import('./config/db.js');
    const { db } = await connectToDatabase();
    const vouchers = await db.collection('vouchers').find({}).limit(5).toArray();
    res.json({ success: true, count: vouchers.length, data: vouchers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/billings', billingRoutes);
app.use('/api/academic-account', academicAccountRoutes);
app.use('/api/superadmin/settings', superAdminSettingsRoutes);
app.use('/api/superadmin/admins', superAdminAdminsRoutes);
app.use('/api/import', importRoutes);
// Debug middleware for accounting routes
app.use('/api/accounting', (req, res, next) => {
  console.log(`[Accounting API] ${req.method} ${req.originalUrl}`, {
    query: req.query,
    headers: req.headers.authorization ? 'Auth present' : 'No auth'
  });
  next();
});
app.use('/api/accounting', accountingRoutes);
app.use('/api/billing', billingGenRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin/attendance', adminAttendanceRoutes);
app.use('/api/admin-contacts', adminContactsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Catch-all handler for unmatched routes
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available roles: superadmin, schooladmin, accountant, teacher, student, parent');
});
