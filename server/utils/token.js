import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

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
