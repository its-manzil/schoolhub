import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

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
