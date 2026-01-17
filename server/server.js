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

// JWT utilities with role and school support
const generateToken = (user, remember) => {
  return jwt.sign(
    { 
      id: user._id.toString(), 
      username: user.username,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      permissions: user.permissions || []
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: remember ? '7d' : '1d' }
  );
};

// Middleware to verify token and extract user info
const verifyToken = (req, res, next) => {
  const authHeaderToken = req.headers.authorization?.split(' ')[1];
  const cookieToken = req.cookies.token;
  const token = authHeaderToken || cookieToken;
  
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
const requireAcademic = requireRole(['academic']);
const requireAcademicOrSchoolAdmin = requireRole(['academic', 'schooladmin', 'superadmin']);



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization','X-Requested-With'],
  credentials: true,
  exposedHeaders: ['Set-Cookie'] // Add this line
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
      { name: 'academics', role: 'academic' },
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

// Get school data for logged-in user (all school-related roles)
app.get('/api/schools/my-school', verifyToken, async (req, res) => {
  try {
    // Prefer schoolId from token if available (for schooladmin and other school-bound roles)
    let schoolId = req.user.schoolId;

    // Fallback: resolve schoolId by looking up user in their role collections
    if (!schoolId) {
      const rawUserId = req.user.id;
      const userId = ObjectId.isValid(rawUserId) ? new ObjectId(rawUserId) : rawUserId;

      const collectionsToSearch = [
        'schooladmins',
        'academics',
        'accountants',
        'teachers',
        'students',
        'parents',
        'administratives',
        'billings'
      ];

      for (const collectionName of collectionsToSearch) {
        const userDoc = await db.collection(collectionName).findOne({ _id: userId });
        if (userDoc && userDoc.schoolId) {
          schoolId = userDoc.schoolId;
          break;
        }
      }
    }

    if (!schoolId) {
      return res.status(404).json({ success: false, message: 'School data not found for user' });
    }

    const numericSchoolId = typeof schoolId === 'string' ? parseInt(schoolId) : schoolId;

    const school = await db.collection('schools').findOne({ schoolId: numericSchoolId });

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    res.json({ success: true, data: school });
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch school data' });
  }
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

    const safeUserData = { ...userData };
    delete safeUserData.password_hash;
    
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

// Get school by schoolId (for school admin and academic users)
app.get('/api/schools/school/:schoolId', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
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

// Add these imports at the top if not already present


// ============================================================================
// TEACHERS ROUTES
// ============================================================================

// Get all teachers for a school (for school admin)
// ============================================================================
// TEACHERS ROUTES
// ============================================================================

// Get all teachers for a school (for school admin)
app.get('/api/teachers', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const user = req.user;
    
    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'School admin data not found' 
      });
    }

    const teachers = await db.collection('teachers')
      .find({ 
        schoolId: adminData.schoolId,
        isActive: true 
      })
      .sort({ createdAt: -1 })
      .toArray();

    const safeTeachers = teachers.map(teacher => {
      const safeTeacher = { ...teacher };
      delete safeTeacher.password_hash;
      return safeTeacher;
    });
    
    res.json({ 
      success: true, 
      data: safeTeachers 
    });
    
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch teachers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get teacher by ID (for details modal)
app.get('/api/teachers/:id', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'School admin data not found' 
      });
    }

    const teacher = await db.collection('teachers').findOne({ 
      _id: new ObjectId(id),
      schoolId: adminData.schoolId 
    });

    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    const teacherResponse = { ...teacher };
    delete teacherResponse.password_hash;
    
    res.json({ 
      success: true, 
      data: teacherResponse 
    });
    
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add new teacher endpoint
app.post('/api/teachers', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      subjects,
      teachingClass,
      salary,
      joiningDate,
      profilePicture,
      password,
      schoolId
    } = req.body;

    console.log('Adding new teacher:', { name, email, schoolId });

    // Validate required fields
    if (!name || !phone || !email || !password || !schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, phone, email, password, and schoolId are required' 
      });
    }

    // Check if teacher already exists in this school
    const existingTeacher = await db.collection('teachers').findOne({
      $or: [
        { email: email },
        { phone: phone }
      ],
      schoolId: parseInt(schoolId)
    });

    if (existingTeacher) {
      return res.status(409).json({ 
        success: false, 
        message: 'Teacher with this email or phone already exists in this school' 
      });
    }

    // Get the last teacher ID for this school to auto-increment
    const lastTeacher = await db.collection('teachers')
      .find({ schoolId: parseInt(schoolId) })
      .sort({ teacherId: -1 })
      .limit(1)
      .toArray();

    let teacherNumber;
    if (lastTeacher.length > 0) {
      const lastId = lastTeacher[0].teacherId;
      // Extract the last 3 digits
      const match = lastId.match(/(\d+)$/);
      if (match) {
        const lastNumber = parseInt(match[1]);
        teacherNumber = (lastNumber + 1).toString().padStart(3, '0');
      } else {
        teacherNumber = '001';
      }
    } else {
      teacherNumber = '001';
    }

    const teacherId = `${schoolId}TR${teacherNumber}`;
    console.log('Generated teacher ID:', teacherId);

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create teacher document
    const teacher = {
      teacherId,
      name,
      phone,
      email,
      address: address || '',
      subjects: Array.isArray(subjects) ? subjects : (typeof subjects === 'string' ? subjects.split(',').map(s => s.trim()).filter(s => s) : []),
      teachingClass: teachingClass || '',
      salary: parseFloat(salary) || 0,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      profilePicture: profilePicture || null,
      schoolId: parseInt(schoolId),
      password_hash: hashedPassword,
      role: 'teacher',
      permissions: [
        'manage_assignments',
        'view_students',
        'submit_grades',
        'view_class_schedule'
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };

    // Insert into teachers collection
    const result = await db.collection('teachers').insertOne(teacher);
    console.log('Teacher inserted with ID:', result.insertedId);

    const teacherResponse = { ...teacher };
    delete teacherResponse.password_hash;

    res.status(201).json({ 
      success: true, 
      message: 'Teacher added successfully',
      data: {
        teacher: teacherResponse,
        credentials: {
          teacherId: teacherId,
          email: email,
          password: password, // Only returned once
          note: 'Please save these credentials and provide them to the teacher'
        }
      }
    });
    
  } catch (error) {
    console.error('Add teacher error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update teacher
app.put('/api/teachers/:id', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'School admin data not found' 
      });
    }

    // Check if teacher exists and belongs to the same school
    const existingTeacher = await db.collection('teachers').findOne({ 
      _id: new ObjectId(id),
      schoolId: adminData.schoolId 
    });

    if (!existingTeacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    // Don't allow updating teacherId, schoolId, or password through this endpoint
    delete updateData.teacherId;
    delete updateData.schoolId;
    delete updateData.password_hash;

    // Update teacher
    const result = await db.collection('teachers').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    const updatedTeacher = await db.collection('teachers').findOne({ _id: new ObjectId(id) });
    
    const teacherResponse = { ...updatedTeacher };
    delete teacherResponse.password_hash;

    res.json({ 
      success: true, 
      message: 'Teacher updated successfully', 
      data: teacherResponse 
    });
    
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete teacher (soft delete)
app.delete('/api/teachers/:id', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'School admin data not found' 
      });
    }

    // Check if teacher exists and belongs to the same school
    const teacher = await db.collection('teachers').findOne({ 
      _id: new ObjectId(id),
      schoolId: adminData.schoolId 
    });

    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teacher not found' 
      });
    }

    // Soft delete by setting isActive to false
    await db.collection('teachers').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date().toISOString() } }
    );

    res.json({ 
      success: true, 
      message: 'Teacher deactivated successfully' 
    });
    
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Upload school logo
app.post('/api/schools/upload-logo', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { logo } = req.body;
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Validate base64 data
    if (!logo || typeof logo !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid image data' });
    }

    // Check if base64 string is valid
    if (!logo.match(/^[A-Za-z0-9+/]+=*$/)) {
      return res.status(400).json({ success: false, message: 'Invalid base64 format' });
    }

    // Calculate size (approximately)
    const sizeInBytes = Math.ceil((logo.length * 3) / 4);
    const sizeInKB = sizeInBytes / 1024;

    // Check if compressed to under 100KB
    if (sizeInKB > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image must be compressed to under 100KB' 
      });
    }

    // Update school with logo
    const result = await db.collection('schools').updateOne(
      { schoolId: adminData.schoolId },
      { 
        $set: { 
          logo: logo,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const updatedSchool = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    res.json({ 
      success: true, 
      message: 'Logo uploaded successfully', 
      data: updatedSchool 
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload logo' });
  }
});

// Upload principal signature
app.post('/api/schools/upload-signature', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { principalSignature } = req.body;
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Validate base64 data
    if (!principalSignature || typeof principalSignature !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid image data' });
    }

    // Check if base64 string is valid
    if (!principalSignature.match(/^[A-Za-z0-9+/]+=*$/)) {
      return res.status(400).json({ success: false, message: 'Invalid base64 format' });
    }

    // Calculate size (approximately)
    const sizeInBytes = Math.ceil((principalSignature.length * 3) / 4);
    const sizeInKB = sizeInBytes / 1024;

    // Check if compressed to under 100KB
    if (sizeInKB > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image must be compressed to under 100KB' 
      });
    }

    // Update school with signature
    const result = await db.collection('schools').updateOne(
      { schoolId: adminData.schoolId },
      { 
        $set: { 
          principalSignature: principalSignature,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const updatedSchool = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    res.json({ 
      success: true, 
      message: 'Signature uploaded successfully', 
      data: updatedSchool 
    });
  } catch (error) {
    console.error('Upload signature error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload signature' });
  }
});

// Remove school logo
app.delete('/api/schools/remove-logo', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Remove logo from school
    const result = await db.collection('schools').updateOne(
      { schoolId: adminData.schoolId },
      { 
        $unset: { logo: "" },
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const updatedSchool = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    res.json({ 
      success: true, 
      message: 'Logo removed successfully', 
      data: updatedSchool 
    });
  } catch (error) {
    console.error('Remove logo error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove logo' });
  }
});

// Remove principal signature
app.delete('/api/schools/remove-signature', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Remove signature from school
    const result = await db.collection('schools').updateOne(
      { schoolId: adminData.schoolId },
      { 
        $unset: { principalSignature: "" },
        $set: { updatedAt: new Date().toISOString() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const updatedSchool = await db.collection('schools').findOne({ schoolId: adminData.schoolId });
    res.json({ 
      success: true, 
      message: 'Signature removed successfully', 
      data: updatedSchool 
    });
  } catch (error) {
    console.error('Remove signature error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove signature' });
  }
});

// ============================================================================
// STUDENTS ROUTES
// ============================================================================

// ============================================================================
// STUDENTS ROUTES (Updated)
// ============================================================================

// Get all students for a school (for school admin)
app.get('/api/students', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const user = req.user;
    
    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'School admin data not found' 
      });
    }

    const students = await db.collection('students')
      .find({ 
        schoolId: adminData.schoolId,
        isActive: true 
      })
      .sort({ name: 1 }) // Sort alphabetically by name
      .toArray();

    // Assign roll numbers based on alphabetical order within each class
    const classGroups = {};
    students.forEach(student => {
      if (!classGroups[student.className]) {
        classGroups[student.className] = [];
      }
      classGroups[student.className].push(student);
    });

    // Sort each class group alphabetically and assign roll numbers
    Object.keys(classGroups).forEach(className => {
      classGroups[className].sort((a, b) => a.name.localeCompare(b.name));
      classGroups[className].forEach((student, index) => {
        student.rollNumber = index + 1;
      });
    });

    const updatedStudents = Object.values(classGroups).flat();

    const safeStudents = updatedStudents.map(student => {
      const safeStudent = { ...student };
      delete safeStudent.password_hash;
      return safeStudent;
    });
    
    res.json({ 
      success: true, 
      data: safeStudents 
    });
    
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch students',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get student by ID (for details modal)
app.get('/api/students/:id', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Get school admin data to find schoolId
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({ 
        success: false, 
        message: 'School admin data not found' 
      });
    }

    const student = await db.collection('students').findOne({ 
      _id: new ObjectId(id),
      schoolId: adminData.schoolId 
    });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    const studentResponse = { ...student };
    delete studentResponse.password_hash;

    res.json({ 
      success: true, 
      data: studentResponse 
    });
    
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper function to format class code
const formatClassCode = (className) => {
  switch(className.toUpperCase()) {
    case 'N':
      return '0N';
    case 'LKG':
      return '0L';
    case 'UKG':
      return '0U';
    default:
      // For classes 1-12, ensure they're 2 digits
      const classNum = parseInt(className);
      if (!isNaN(classNum) && classNum >= 1 && classNum <= 12) {
        return classNum.toString().padStart(2, '0');
      }
      return className.padStart(2, '0');
  }
};

// Helper function to get next sequential number for student ID
const getNextStudentSequence = async (schoolId, currentYear, className) => {
  const classCode = formatClassCode(className);
  const idPattern = `${schoolId}${currentYear}${classCode}`;
  
  // Find all students with matching pattern for this school, year, and class
  const existingStudents = await db.collection('students')
    .find({
      studentId: { $regex: `^${idPattern}` },
      schoolId: parseInt(schoolId)
    })
    .sort({ studentId: -1 })
    .toArray();
  
  if (existingStudents.length === 0) {
    return '001'; // First student in this class/year
  }
  
  // Get the highest sequence number
  let maxSequence = 0;
  existingStudents.forEach(student => {
    const sequencePart = student.studentId.slice(idPattern.length);
    const sequenceNum = parseInt(sequencePart);
    if (!isNaN(sequenceNum) && sequenceNum > maxSequence) {
      maxSequence = sequenceNum;
    }
  });
  
  // Return next sequence number padded to 3 digits
  return (maxSequence + 1).toString().padStart(3, '0');
};

// Helper function to generate student ID
const generateStudentId = async (schoolId, className, admissionYear = null) => {
  const currentYear = admissionYear || new Date().getFullYear();
  const classCode = formatClassCode(className);
  
  // Get the next sequential number
  const sequence = await getNextStudentSequence(schoolId, currentYear, className);
  
  // Generate student ID: SchoolID + Year + ClassCode + Sequence
  return `${schoolId}${currentYear}${classCode}${sequence}`;
};

// Add new student endpoint
app.post('/api/students', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const {
      name,
      gender,
      dateOfBirth,
      phone,
      email,
      address,
      fatherName,
      motherName,
      fatherPhone,
      motherPhone,
      className,
      section,
      bloodGroup,
      emergencyContact,
      admissionDate,
      profilePicture,
      password,
      schoolId
    } = req.body;

    console.log('Adding new student:', { name, className, schoolId });

    // Validate required fields
    if (!name || !gender || !dateOfBirth || !phone || !address || 
        !fatherName || !fatherPhone || !className || !section || 
        !emergencyContact || !password || !schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be filled' 
      });
    }

    // Check if student already exists in this school with same phone
    const existingStudent = await db.collection('students').findOne({
      $or: [
        { phone: phone },
        { email: email ? email : null }
      ].filter(condition => condition),
      schoolId: parseInt(schoolId),
      isActive: true
    });

    if (existingStudent) {
      return res.status(409).json({ 
        success: false, 
        message: 'Student with this phone or email already exists in this school' 
      });
    }

    // Extract admission year from admission date or use current year
    let admissionYear;
    if (admissionDate) {
      admissionYear = new Date(admissionDate).getFullYear();
    } else {
      admissionYear = new Date().getFullYear();
    }

    // Generate unique student ID
    const studentId = await generateStudentId(schoolId, className, admissionYear);
    console.log('Generated student ID:', studentId);

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Get the next roll number for this class (alphabetical order will be handled on fetch)
    // For now, assign a temporary roll number
    const studentsInClass = await db.collection('students')
      .find({
        schoolId: parseInt(schoolId),
        className: className,
        section: section,
        isActive: true
      })
      .toArray();
    
    const tempRollNumber = studentsInClass.length + 1;

    // Create student document
    const student = {
      studentId,
      name,
      gender,
      dateOfBirth,
      phone,
      email: email || null,
      address,
      fatherName,
      motherName,
      fatherPhone,
      motherPhone: motherPhone || null,
      className,
      section,
      rollNumber: tempRollNumber, // Will be reassigned alphabetically on fetch
      bloodGroup: bloodGroup || null,
      emergencyContact,
      admissionDate: admissionDate || new Date().toISOString().split('T')[0],
      admissionYear: admissionYear,
      profilePicture: profilePicture || null,
      schoolId: parseInt(schoolId),
      password_hash: hashedPassword,
      role: 'student',
      permissions: [
        'view_assignments',
        'view_grades',
        'view_timetable',
        'view_attendance'
      ],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };

    // Insert into students collection
    const result = await db.collection('students').insertOne(student);
    console.log('Student inserted with ID:', result.insertedId);

    // Also insert into parents collection if not exists
    const existingParent = await db.collection('parents').findOne({
      $or: [
        { phone: fatherPhone },
        { email: email ? email : null }
      ].filter(condition => condition)
    });

    if (!existingParent) {
      const parent = {
        name: fatherName,
        phone: fatherPhone,
        email: email || null,
        password_hash: hashedPassword, // Same password for parent login
        role: 'parent',
        schoolId: parseInt(schoolId),
        children: [studentId],
        permissions: [
          'view_child_grades',
          'view_child_attendance',
          'view_child_timetable',
          'pay_fees'
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null
      };

      await db.collection('parents').insertOne(parent);
    } else {
      // Update existing parent with new child
      await db.collection('parents').updateOne(
        { _id: existingParent._id },
        { 
          $addToSet: { children: studentId },
          $set: { updatedAt: new Date().toISOString() }
        }
      );
    }

    const studentResponse = { ...student };
    delete studentResponse.password_hash;

    res.status(201).json({ 
      success: true, 
      message: 'Student added successfully',
      data: {
        student: studentResponse,
        credentials: {
          studentId: studentId,
          phone: phone,
          email: email,
          password: password, // Only returned once
          note: 'Student ID is permanent and will be used for parent login. Please save these credentials.'
        }
      }
    });
    
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update student endpoint
app.put('/api/students/:id', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
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

    const existingStudent = await db.collection('students').findOne({ 
      _id: new ObjectId(id),
      schoolId
    });

    if (!existingStudent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Don't allow updating studentId, schoolId, or password through this endpoint
    delete updateData.studentId;
    delete updateData.schoolId;
    
    // If password is provided, hash it
    if (updateData.password) {
      updateData.password_hash = await hashPassword(updateData.password);
      delete updateData.password;
      delete updateData.rePassword;
    } else {
      delete updateData.password_hash;
    }

    // IMPORTANT: Student ID remains permanent even when class changes
    // If class changes, we need to update admissionYear if it's a new academic year
    if (updateData.className && updateData.className !== existingStudent.className) {
      const currentYear = new Date().getFullYear();
      // Check if this is a promotion to next class in new academic year
      if (currentYear > existingStudent.admissionYear) {
        updateData.admissionYear = currentYear;
      }
    }

    // Update student
    const result = await db.collection('students').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    const updatedStudent = await db.collection('students').findOne({ _id: new ObjectId(id) });
    
    const studentResponse = { ...updatedStudent };
    delete studentResponse.password_hash;

    res.json({ 
      success: true, 
      message: 'Student updated successfully', 
      data: studentResponse 
    });
    
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete student (soft delete)
app.delete('/api/students/:id', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
    const { id } = req.params;
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

    const student = await db.collection('students').findOne({ 
      _id: new ObjectId(id),
      schoolId
    });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Soft delete by setting isActive to false
    await db.collection('students').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date().toISOString() } }
    );

    // Also remove student from parent's children list
    await db.collection('parents').updateOne(
      { phone: student.fatherPhone },
      { $pull: { children: student.studentId } }
    );

    res.json({ 
      success: true, 
      message: 'Student deactivated successfully' 
    });
    
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Academic view: get students for school admins and academic users
app.get('/api/academic/students', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
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

// Get parents with children details for a school
app.get('/api/parents', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const user = req.user;

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });

    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    const parents = await db.collection('parents')
      .find({
        schoolId: adminData.schoolId,
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
          schoolId: adminData.schoolId
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
    console.error('Get parents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parents',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Academic view: get parents with children details for academic users and school admins
app.get('/api/academic/parents', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
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

app.get('/api/academic/subjects/routines', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
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

app.post('/api/academic/subjects/routines', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
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

// Academic account routes
app.get('/api/academic-account', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const user = req.user;

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    const account = await db.collection('academics').findOne(
      { schoolId: adminData.schoolId },
      { projection: { password_hash: 0 } }
    );

    res.json({
      success: true,
      data: account || null
    });
  } catch (error) {
    console.error('Get academic account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch academic account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

app.post('/api/academic-account', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const user = req.user;
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    const existingForSchool = await db.collection('academics').findOne({
      schoolId: adminData.schoolId
    });

    if (existingForSchool) {
      return res.status(400).json({
        success: false,
        message: 'Academic account already exists for this school'
      });
    }

    const existingUsername = await db.collection('academics').findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    const hashedPassword = await hashPassword(password);

    const academicAccount = {
      username,
      email: null,
      phone: null,
      role: 'academic',
      schoolId: adminData.schoolId,
      permissions: [],
      password_hash: hashedPassword,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null
    };

    const result = await db.collection('academics').insertOne(academicAccount);

    const safeAccount = { ...academicAccount };
    delete safeAccount.password_hash;

    res.status(201).json({
      success: true,
      message: 'Academic account created successfully',
      data: { ...safeAccount, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Create academic account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create academic account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

app.delete('/api/academic-account', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const user = req.user;

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    const result = await db.collection('academics').deleteOne({
      schoolId: adminData.schoolId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Academic account not found for this school'
      });
    }

    res.json({
      success: true,
      message: 'Academic account deleted successfully'
    });
  } catch (error) {
    console.error('Delete academic account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete academic account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

app.put('/api/academic-account/password/admin', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const user = req.user;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    if (!adminData || !adminData.schoolId) {
      return res.status(404).json({
        success: false,
        message: 'School admin data not found'
      });
    }

    const account = await db.collection('academics').findOne({
      schoolId: adminData.schoolId
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Academic account not found for this school'
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
      message: 'Academic password updated successfully'
    });
  } catch (error) {
    console.error('Admin update academic password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update academic password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

app.put('/api/academic-account/password/self', verifyToken, requireAcademic, async (req, res) => {
  try {
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

// Exams routes
app.get('/api/exams', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
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

app.get('/api/exams/:id', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
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

app.post('/api/exams', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
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

app.put('/api/exams/:id', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
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

app.delete('/api/exams/:id', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
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

// Academic view: get exams for academic users and school admins
app.get('/api/academic/exams', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
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
app.post('/api/academic/exams', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
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
app.put('/api/academic/exams/:id', verifyToken, requireAcademicOrSchoolAdmin, async (req, res) => {
  try {
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

// Get school with ID
app.get('/api/schools/:id', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    let school;
    
    // Check if id is schoolId (number) or _id (ObjectId)
    if (/^\d+$/.test(id)) {
      // It's a schoolId (numeric)
      school = await db.collection('schools').findOne({ schoolId: parseInt(id) });
    } else {
      // It's an _id
      school = await db.collection('schools').findOne({ _id: new ObjectId(id) });
    }
    
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
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update school logo and signature
app.put('/api/schools/:id/branding', verifyToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { logo, principalSignature } = req.body;

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (logo) updateData.logo = logo;
    if (principalSignature) updateData.principalSignature = principalSignature;

    const result = await db.collection('schools').updateOne(
      { schoolId: parseInt(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'School branding updated successfully'
    });
    
  } catch (error) {
    console.error('Update school branding error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update school branding',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});
// ============================================================================
// ERROR HANDLING
// ============================================================================

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
