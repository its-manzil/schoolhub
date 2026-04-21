import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';
import { verifyAuth, getNumericSchoolId } from '../../lib/auth';

// GET /api/academic/holidays?academicYear=
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.schoolId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear');
    const schoolId = getNumericSchoolId(user.schoolId);

    if (!academicYear) return NextResponse.json({ success: false, message: 'Academic year required' }, { status: 400 });

    const holidays = await db.collection('academic_holidays').findOne({ schoolId, academicYear });

    return NextResponse.json({ 
      success: true, 
      data: holidays?.days || {
        Sunday: false, Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false
      }
    });
  } catch (error) {
    console.error('GET holidays error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch holidays' }, { status: 500 });
  }
}

// POST /api/academic/holidays
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.schoolId) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    let { academicYear, days } = body;

    if (!academicYear || !days) return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });

    // Basic sanitization
    academicYear = academicYear.trim().replace(/[<>]/g, '');
    days = Object.fromEntries(
      Object.entries(days as Record<string, boolean>).map(([day, isHoliday]) => [day, !!isHoliday])
    );

    const { db } = await connectToDatabase();
    const schoolId = getNumericSchoolId(user.schoolId);

    await db.collection('academic_holidays').updateOne(
      { schoolId, academicYear },
      { $set: { days, updatedAt: new Date() } },
      { upsert: true }
    );

    // Sync to all class routines for this year
    await db.collection('class_routines').updateMany(
      { schoolId, academicYear },
      { $set: { holidays: days, updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, message: 'Holidays updated for entire academic year' });
  } catch (error) {
    console.error('POST holidays error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update holidays' }, { status: 500 });
  }
}
