import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (user, remember) => {
  return jwt.sign(
    { 
      id: user._id.toString(), 
      username: user.username,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      permissions: user.permissions || []
    },
    JWT_SECRET,
    { expiresIn: remember ? '7d' : '1d' }
  );
};

export const verifyTokenValue = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw err;
  }
};

export const getSchoolId = async (db, user) => {
  if (!user) {
    return null;
  }
  
  // Get school ID based on user role
  if (user.role === 'schooladmin') {
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    return adminData?.schoolId;
  } else if (user.role === 'superadmin') {
    // For superadmin, you might want to add logic to allow selecting any school
    // For now, return null or implement selection logic
    return null;
  } else {
    // For other roles, return their associated school ID
    return user.schoolId;
  }
};
