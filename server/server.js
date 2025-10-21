import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { MongoClient, ObjectId } from 'mongodb';

// Initialize environment variables
dotenv.config();

// Initialize Express app
const app = express();

// MongoDB connection
let db;
const connectToMongoDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    
    await client.connect();
    db = client.db('SchoolHub');
    console.log('Connected to MongoDB - Database: SchoolHub');
    
    // Verify connection by listing collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(col => col.name));
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectToMongoDB();

// Password utilities
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// JWT utilities with role support
const generateToken = (user, remember) => {
  return jwt.sign(
    { 
      id: user._id.toString(), 
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions || []
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: remember ? '7d' : '1d' }
  );
};

// Middleware to verify token and extract user info
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token', err });
  }
};

// Role-based middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }
    
    next();
  };
};

// Specific role middlewares
const requireSuperAdmin = requireRole(['superadmin']);
const requireSchoolAdmin = requireRole(['schooladmin', 'superadmin']);
const requireAccountant = requireRole(['accountant', 'schooladmin', 'superadmin']);
const requireTeacher = requireRole(['teacher', 'schooladmin', 'superadmin']);
const requireStudent = requireRole(['student']);
const requireParent = requireRole(['parent']);



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', database: 'SchoolHub' });
});

// ============================================================================
// AUTH ROUTES
// ============================================================================

// Unified Login endpoint for all roles
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password, remember } = req.body;
    
    console.log('Login attempt:', identifier);
    
    // Define all possible user collections and their roles
    const userCollections = [
      { name: 'superadmins', role: 'superadmin' },
      { name: 'schooladmins', role: 'schooladmin' },
      { name: 'accountants', role: 'accountant' },
      { name: 'teachers', role: 'teacher' },
      { name: 'students', role: 'student' },
      { name: 'parents', role: 'parent' },
      { name: 'users', role: 'user' } // Fallback collection
    ];

    let user = null;
    let userRole = null;
    let collectionName = null;

    // Search through all collections
    for (const collection of userCollections) {
      user = await db.collection(collection.name).findOne(
        {
          $or: [
            { email: identifier },
            { username: identifier },
            { phone: identifier }
          ]
        },
        { projection: { password_hash: 0 } }
      );

      if (user) {
        userRole = collection.role;
        collectionName = collection.name;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Verify password
    const userWithPassword = await db.collection(collectionName).findOne({
      _id: user._id
    });

    const isMatch = await comparePassword(password, userWithPassword.password_hash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Add role to user object
    user.role = userRole;

    // Generate token with role information
    const token = generateToken(user, remember);
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    });

    // Update last login
    await db.collection(collectionName).updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date().toISOString(), updatedAt: new Date().toISOString() } }
    );

    console.log('Login successful:', identifier, 'Role:', userRole);
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      token,
      user: {
        ...user,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed',
      error: error.message
    });
  }
});

// Check authentication status
app.get('/api/auth/check', verifyToken, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Authenticated',
    user: req.user 
  });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// SuperAdmin Registration Endpoint
app.post('/api/auth/create-superadmin', async (req, res) => {
  try {
    const { username, phone, email, password } = req.body;
    
    // Validate required fields
    if (!username || !phone || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }
    
    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }
    
    // Check if user already exists in any collection
    const existingUser = await db.collection('superadmins').findOne({
      $or: [
        { email: email },
        { username: username },
        { phone: phone }
      ]
    });
    
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email, username or phone already exists' 
      });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create superadmin document
    const superAdmin = {
      username,
      phone,
      email,
      password_hash: hashedPassword,
      role: 'superadmin',
      permissions: ['all'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };
    
    const result = await db.collection('superadmins').insertOne(superAdmin);
    
    console.log('SuperAdmin created successfully with ID:', result.insertedId);
    
    res.status(201).json({ 
      success: true, 
      message: 'SuperAdmin account created successfully!',
      data: {
        id: result.insertedId,
        username,
        email,
        phone,
        role: 'superadmin'
      }
    });
    
  } catch (error) {
    console.error('Create superadmin error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create SuperAdmin account',
      error: error.message 
    });
  }
});

// ============================================================================
// ROLE-SPECIFIC DASHBOARD ENDPOINTS
// ============================================================================

// SuperAdmin Dashboard
app.get('/api/dashboard/superadmin', verifyToken, requireSuperAdmin, (req, res) => {
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
app.get('/api/dashboard/schooladmin', verifyToken, requireSchoolAdmin, (req, res) => {
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
app.get('/api/dashboard/accountant', verifyToken, requireAccountant, (req, res) => {
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
app.get('/api/dashboard/teacher', verifyToken, requireTeacher, (req, res) => {
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
app.get('/api/dashboard/student', verifyToken, requireStudent, (req, res) => {
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
app.get('/api/dashboard/parent', verifyToken, requireParent, (req, res) => {
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

// ============================================================================
// SCHOOLS ROUTES (SuperAdmin and SchoolAdmin only)
// ============================================================================
app.delete('/api/schools/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Attempting to delete school with ID:', id);
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'School ID is required' 
      });
    }

    // Find the school first to get schoolId
    const school = await db.collection('schools').findOne({ _id: new ObjectId(id) });
    
    if (!school) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }

    // Delete the school
    const deleteResult = await db.collection('schools').deleteOne({ _id: new ObjectId(id) });
    
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }

    // Delete associated admin account
    await db.collection('schooladmins').deleteOne({ schoolId: school.schoolId });

    console.log(`School ${school.schoolId} deleted successfully`);
    
    res.json({ 
      success: true, 
      message: 'School and associated admin account deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete school error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete school',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET school by ID for editing
app.get('/api/schools/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'School ID is required' 
      });
    }

    const school = await db.collection('schools').findOne({ _id: new ObjectId(id) });
    
    if (!school) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }

    res.json({ 
      success: true, 
      data: school 
    });
    
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch school',
      error: error.message 
    });
  }
});

// UPDATE school endpoint
app.put('/api/schools/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, contactEmail, contactPhone, subscriptionYears } = req.body;
    
    console.log('Updating school:', id, req.body);
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'School ID is required' 
      });
    }

    // Validate required fields
    if (!name || !address || !contactEmail || !contactPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Validate subscription years (1-3)
    if (!subscriptionYears || subscriptionYears < 1 || subscriptionYears > 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subscription years must be between 1 and 3' 
      });
    }

    // Find existing school
    const existingSchool = await db.collection('schools').findOne({ _id: new ObjectId(id) });
    
    if (!existingSchool) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }

    // Calculate new subscription details
    const subscribedDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + subscriptionYears);
    
    const subscriptionAmount = subscriptionYears * 30000;
    const isActive = new Date() <= expiryDate;
    
    // Calculate remaining days
    const today = new Date();
    const timeDiff = expiryDate.getTime() - today.getTime();
    const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const updateData = {
      name,
      address,
      contactEmail,
      contactPhone,
      subscription: {
        years: subscriptionYears,
        amount: subscriptionAmount,
        subscribedDate: subscribedDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        isActive,
        remainingDays: remainingDays > 0 ? remainingDays : 0
      },
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('schools').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }

    // Also update school name in admin account if school name changed
    if (name !== existingSchool.name) {
      await db.collection('schooladmins').updateOne(
        { schoolId: existingSchool.schoolId },
        { $set: { schoolName: name, updatedAt: new Date().toISOString() } }
      );
    }

    console.log(`School ${existingSchool.schoolId} updated successfully`);
    
    res.json({ 
      success: true, 
      message: 'School updated successfully',
      data: { ...updateData, _id: id, schoolId: existingSchool.schoolId }
    });
    
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update school',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});


// Update the POST /api/schools endpoint to include admin creation
app.post('/api/schools', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { name, address, contactEmail, contactPhone, subscriptionYears, adminPassword } = req.body;
    
    // Validate required fields
    if (!name || !address || !contactEmail || !contactPhone || !subscriptionYears) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Get the last school ID to auto-increment
    const lastSchool = await db.collection('schools')
      .find()
      .sort({ schoolId: -1 })
      .limit(1)
      .toArray();
    
    const nextSchoolId = lastSchool.length > 0 ? lastSchool[0].schoolId + 1 : 1001;
    
    // Calculate subscription details
    const subscribedDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + subscriptionYears);
    
    const subscriptionAmount = subscriptionYears * 30000;
    const isActive = new Date() <= expiryDate;
    
    // Calculate remaining days
    const today = new Date();
    const timeDiff = expiryDate.getTime() - today.getTime();
    const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    const newSchool = {
      schoolId: nextSchoolId,
      name,
      address,
      contactEmail,
      contactPhone,
      subscription: {
        years: subscriptionYears,
        amount: subscriptionAmount,
        subscribedDate: subscribedDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        isActive,
        remainingDays: remainingDays > 0 ? remainingDays : 0
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Insert school
    const result = await db.collection('schools').insertOne(newSchool);
    
    // Create admin account for the school
    const adminUsername = `${nextSchoolId}_admin`;
    
    // Use custom password if provided, otherwise generate default
    const finalAdminPassword = adminPassword || `admin${nextSchoolId}`;
    const adminEmail = `admin${nextSchoolId}@${name.toLowerCase().replace(/\s+/g, '')}.edu`;
    
    // Hash admin password
    const hashedPassword = await hashPassword(finalAdminPassword);
    
    const schoolAdmin = {
      username: adminUsername,
      email: adminEmail,
      password_hash: hashedPassword,
      role: 'schooladmin',
      schoolId: nextSchoolId,
      schoolName: name,
      permissions: [
        'manage_teachers',
        'manage_students', 
        'manage_classes',
        'view_reports',
        'manage_school_settings'
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };
    
    // Insert school admin
    await db.collection('schooladmins').insertOne(schoolAdmin);
    
    console.log(`School created with ID: ${nextSchoolId}`);
    console.log(`Admin account created - Username: ${adminUsername}, Password: ${finalAdminPassword}`);
    
    res.status(201).json({ 
      success: true, 
      message: 'School added successfully with admin account',
      data: { 
        ...newSchool, 
        _id: result.insertedId,
        adminAccount: {
          username: adminUsername,
          password: finalAdminPassword, // Only returned once for initial setup
          email: adminEmail,
          note: adminPassword ? 'Using custom password' : 'Using auto-generated password'
        }
      }
    });
    
  } catch (error) {
    console.error('Add school error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add school',
      error: error.message 
    });
  }
});

// Get all schools
app.get('/api/schools', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const schools = await db.collection('schools').find().toArray();
    res.json({ success: true, data: schools });
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schools' });
  }
});

// Get school data for school admin
app.get('/api/schools/admin/:schoolId', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { schoolId } = req.params;
    const school = await db.collection('schools').findOne({ schoolId: parseInt(schoolId) });
    
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    res.json({ success: true, data: school });
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch school data' });
  }
});

// Update school details
app.put('/api/schools/:id', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await db.collection('schools').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const updatedSchool = await db.collection('schools').findOne({ _id: new ObjectId(id) });
    res.json({ success: true, message: 'School updated successfully', data: updatedSchool });
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({ success: false, message: 'Failed to update school' });
  }
});

// Add subscription
app.post('/api/schools/:id/subscription', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { years, advanceSubscription } = req.body;

    const school = await db.collection('schools').findOne({ _id: new ObjectId(id) });
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const currentDate = new Date();
    let newExpiryDate = new Date(school.subscription.expiryDate);
    
    if (advanceSubscription && school.subscription.isActive) {
      // Add new years to existing expiry date
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + years);
    } else {
      // Start from current date
      newExpiryDate = new Date();
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + years);
    }

    const subscriptionAmount = years * 30000;
    const isActive = new Date() <= newExpiryDate;
    
    // Calculate remaining days
    const timeDiff = newExpiryDate.getTime() - currentDate.getTime();
    const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Create subscription history entry
    const subscriptionHistory = {
      years: years,
      amount: subscriptionAmount,
      subscribedDate: currentDate.toISOString(),
      expiryDate: newExpiryDate.toISOString(),
      paymentDate: currentDate.toISOString(),
      transactionId: `TXN${Date.now()}`
    };

    const updateData = {
      subscription: {
        years: school.subscription.years + years,
        amount: school.subscription.amount + subscriptionAmount,
        subscribedDate: school.subscription.subscribedDate,
        expiryDate: newExpiryDate.toISOString(),
        isActive,
        remainingDays: remainingDays > 0 ? remainingDays : 0,
        totalPaid: (school.subscription.totalPaid || school.subscription.amount) + subscriptionAmount,
        history: [...(school.subscription.history || []), subscriptionHistory]
      },
      updatedAt: currentDate.toISOString()
    };

    await db.collection('schools').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedSchool = await db.collection('schools').findOne({ _id: new ObjectId(id) });
    res.json({ 
      success: true, 
      message: 'Subscription added successfully', 
      data: updatedSchool 
    });

  } catch (error) {
    console.error('Add subscription error:', error);
    res.status(500).json({ success: false, message: 'Failed to add subscription' });
  }
});

// Password verification endpoint
app.post('/api/auth/verify-password', verifyToken, async (req, res) => {
  try {
    const { password } = req.body;
    const user = req.user;

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Find user in their respective collection
    let userCollection;
    switch (user.role) {
      case 'superadmin':
        userCollection = 'superadmins';
        break;
      case 'schooladmin':
        userCollection = 'schooladmins';
        break;
      case 'accountant':
        userCollection = 'accountants';
        break;
      default:
        userCollection = 'users';
    }

    const userData = await db.collection(userCollection).findOne({ _id: new ObjectId(user.id) });
    
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await comparePassword(password, userData.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    res.json({ success: true, message: 'Password verified successfully' });
  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({ success: false, message: 'Password verification failed' });
  }
});

// Get current user data
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Find user in their respective collection
    let userCollection;
    switch (user.role) {
      case 'superadmin':
        userCollection = 'superadmins';
        break;
      case 'schooladmin':
        userCollection = 'schooladmins';
        break;
      case 'accountant':
        userCollection = 'accountants';
        break;
      default:
        userCollection = 'users';
    }

    const userData = await db.collection(userCollection).findOne({ _id: new ObjectId(user.id) });
    
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove sensitive data
    const { password_hash, ...safeUserData } = userData;
    
    res.json({ 
      success: true, 
      user: {
        ...safeUserData,
        role: user.role
      } 
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user data' });
  }
});

// Get school data for logged-in school admin
app.get('/api/schools/admin/school', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const user = req.user;
    
    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({ success: false, message: 'School admin data not found' });
    }

    const school = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    res.json({ success: true, data: school });
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch school data' });
  }
});

// Get school by schoolId (for school admin)
app.get('/api/schools/school/:schoolId', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const school = await db.collection('schools').findOne({ schoolId: parseInt(schoolId) });
    
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    res.json({ success: true, data: school });
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch school data' });
  }
});

// School admin update profile
app.put('/api/schools/admin/update-profile', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const updateData = req.body;
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Update school data
    const result = await db.collection('schools').updateOne(
      { schoolId: adminData.schoolId },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const updatedSchool = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    res.json({ success: true, message: 'School updated successfully', data: updatedSchool });
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({ success: false, message: 'Failed to update school' });
  }
});

// School admin add subscription
app.post('/api/schools/admin/add-subscription', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { years, advanceSubscription } = req.body;
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const school = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const currentDate = new Date();
    let newExpiryDate = new Date(school.subscription.expiryDate);
    
    if (advanceSubscription && school.subscription.isActive) {
      // Add new years to existing expiry date
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + years);
    } else {
      // Start from current date
      newExpiryDate = new Date();
      newExpiryDate.setFullYear(newExpiryDate.getFullYear() + years);
    }

    const subscriptionAmount = years * 30000;
    const isActive = new Date() <= newExpiryDate;
    
    // Calculate remaining days
    const timeDiff = newExpiryDate.getTime() - currentDate.getTime();
    const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Create subscription history entry
    const subscriptionHistory = {
      years: years,
      amount: subscriptionAmount,
      subscribedDate: currentDate.toISOString(),
      expiryDate: newExpiryDate.toISOString(),
      paymentDate: currentDate.toISOString(),
      transactionId: `TXN${Date.now()}`
    };

    const updateData = {
      subscription: {
        years: school.subscription.years + years,
        amount: school.subscription.amount + subscriptionAmount,
        subscribedDate: school.subscription.subscribedDate,
        expiryDate: newExpiryDate.toISOString(),
        isActive,
        remainingDays: remainingDays > 0 ? remainingDays : 0,
        totalPaid: (school.subscription.totalPaid || school.subscription.amount) + subscriptionAmount,
        history: [...(school.subscription.history || []), subscriptionHistory]
      },
      updatedAt: currentDate.toISOString()
    };

    await db.collection('schools').updateOne(
      { schoolId: adminData.schoolId },
      { $set: updateData }
    );

    const updatedSchool = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    res.json({ 
      success: true, 
      message: 'Subscription added successfully', 
      data: updatedSchool 
    });

  } catch (error) {
    console.error('Add subscription error:', error);
    res.status(500).json({ success: false, message: 'Failed to add subscription' });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
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