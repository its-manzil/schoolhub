import express from 'express';
import { getDB } from '../../config/db.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { generateToken } from '../../utils/token.js';
import { verifyToken } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Unified Login endpoint for all roles
router.post('/login', async (req, res) => {
  try {
    const db = getDB();
    const { identifier, password, remember } = req.body;
    
    console.log('Login attempt:', identifier);
    
    // Define all possible user collections and their roles
    const userCollections = [
      { name: 'superadmins', role: 'superadmin' },
      { name: 'schooladmins', role: 'schooladmin' },
      { name: 'accountants', role: 'accountant' },
      { name: 'billings', role: 'billing' },
      { name: 'administratives', role: 'administrative' },
      { name: 'teachers', role: 'teacher' },
      { name: 'students', role: 'student' },
      { name: 'parents', role: 'parent' },
      { name: 'academics', role: 'academic' },
      { name: 'users', role: 'user' }
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
router.get('/check', verifyToken, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Authenticated',
    user: req.user 
  });
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// SuperAdmin Registration Endpoint
router.post('/create-superadmin', async (req, res) => {
  try {
    const db = getDB();
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

// Password verification endpoint
router.post('/verify-password', verifyToken, async (req, res) => {
  try {
    const db = getDB();
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
router.get('/me', verifyToken, async (req, res) => {
  try {
    const db = getDB();
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

export default router;
