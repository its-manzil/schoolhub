import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';
import { verifyAuth, getNumericSchoolId } from '../../lib/auth';
import { SchoolSchedule } from '../../../../../modules/academic/routine/types';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.schoolId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const schoolId = getNumericSchoolId(user.schoolId);

    const schedule = await db.collection('school_schedules').findOne({ schoolId });

    return NextResponse.json({ success: true, data: schedule });
  } catch (error) {
    console.error('GET school schedule error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.schoolId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body: SchoolSchedule = await request.json();
    const { startTime, endTime, periodDuration, holidays, breaks } = body;

    if (!startTime || !endTime || !periodDuration) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const schoolId = getNumericSchoolId(user.schoolId);

    const scheduleData = {
      schoolId,
      startTime,
      endTime,
      periodDuration: Number(periodDuration),
      holidays: holidays || {},
      breaks: breaks || [],
      updatedAt: new Date()
    };

    const result = await db.collection('school_schedules').findOneAndUpdate(
      { schoolId },
      { $set: scheduleData },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'School schedule configured successfully',
      data: result
    });
  } catch (error) {
    console.error('POST school schedule error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
