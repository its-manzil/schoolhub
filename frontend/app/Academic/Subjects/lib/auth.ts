import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

console.log('[Auth] JWT_SECRET loaded:', JWT_SECRET === 'your-secret-key' ? 'using default' : 'from env');

export interface UserToken {
  id: string;
  role: string;
  schoolId: number | string;
  email: string;
}

export async function verifyAuth(request: NextRequest): Promise<UserToken | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as UserToken;
    return decoded;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export function getNumericSchoolId(schoolId: string | number): number {
  return typeof schoolId === 'string' ? parseInt(schoolId) : schoolId;
}