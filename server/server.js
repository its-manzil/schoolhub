import dotenv from "dotenv";
dotenv.config({ path: '/Users/manzil/Developer/NepSof Projects/schoolhub/server/.env' });

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
import billingRoutes from './pages/Accountant/billings.js';
import academicAccountRoutes from './pages/SchoolAdmin/academic-account.js';
import superAdminSettingsRoutes from './pages/SuperAdmin/settings.js';

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectToMongoDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization','X-Requested-With'],
  credentials: true,
  exposedHeaders: ['Set-Cookie']
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', database: 'SchoolHub' });
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
const PORT = process.env.PORT || 2056;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available roles: superadmin, schooladmin, accountant, teacher, student, parent');
});
