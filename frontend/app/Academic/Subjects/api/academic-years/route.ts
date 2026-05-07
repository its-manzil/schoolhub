import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';
import { verifyAuth, getNumericSchoolId } from '../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.schoolId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const schoolId = getNumericSchoolId(user.schoolId);

    // Get unique academic years from subjects collection
    interface SubjectDoc {
      academicYear: string;
    }
    const subjects = await db.collection<SubjectDoc>('subjects')
      .find({ schoolId })
      .toArray();

    const years = Array.from(new Set(subjects.map((s) => s.academicYear))).sort();

    return NextResponse.json({ success: true, years });
  } catch (error) {
    console.error('GET academic years error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
