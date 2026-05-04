import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify token and extract user info
export const verifyToken = (req, res, next) => {
  const authHeaderToken = req.headers.authorization?.split(' ')[1];
  const cookieToken = req.cookies?.token;
  const token = authHeaderToken || cookieToken;
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token', err });
  }
};

// Role-based middleware
export const requireRole = (roles) => {
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
export const requireSuperAdmin = requireRole(['superadmin']);
export const requireSchoolAdmin = requireRole(['schooladmin', 'superadmin', 'administrative']);
export const requireAccounting = requireRole(['accountant', 'schooladmin', 'superadmin']);
export const requireTeacher = requireRole(['teacher', 'schooladmin', 'superadmin']);
export const requireStudent = requireRole(['student']);
export const requireParent = requireRole(['parent']);
export const requireAcademic = requireRole(['academic']);
export const requireAcademicOrSchoolAdmin = requireRole(['academic', 'schooladmin', 'superadmin', 'billing', 'administrative']);

// Middleware to check if school is active (blocks inactive schools)
export const requireActiveSchool = async (req, res, next) => {
  try {
    // SuperAdmins can access regardless of school status
    if (req.user?.role === 'superadmin') {
      return next();
    }
    
    const db = getDB();
    let schoolId = req.user?.schoolId;
    
    // If no schoolId in token, try to find it from user collections
    if (!schoolId && req.user?.id) {
      const userId = ObjectId.isValid(req.user.id) ? new ObjectId(req.user.id) : req.user.id;
      const collectionsToSearch = ['schooladmins', 'academics', 'accountants', 'teachers', 'students', 'parents', 'administratives', 'billings'];
      
      for (const collectionName of collectionsToSearch) {
        const userDoc = await db.collection(collectionName).findOne({ _id: userId });
        if (userDoc?.schoolId) {
          schoolId = userDoc.schoolId;
          break;
        }
      }
    }
    
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        message: 'School ID not found for user' 
      });
    }
    
    const numericSchoolId = typeof schoolId === 'string' ? parseInt(schoolId) : schoolId;
    const school = await db.collection('schools').findOne({ schoolId: numericSchoolId });
    
    if (!school) {
      return res.status(404).json({ 
        success: false, 
        message: 'School not found' 
      });
    }
    
    // Block access if school is inactive
    if (school.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Subscription expired',
        code: 'SCHOOL_INACTIVE',
        details: {
          schoolId: numericSchoolId,
          schoolName: school.name,
          status: school.status,
          expiryDate: school.subscription?.expiryDate,
          message: 'Your school subscription has expired. Please contact your administrator to renew.'
        }
      });
    }
    
    // Add school info to request for later use
    req.school = school;
    next();
    
  } catch (error) {
    console.error('RequireActiveSchool middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to verify school status' 
    });
  }
};
