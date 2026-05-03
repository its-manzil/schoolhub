import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';
import { verifyAuth, getNumericSchoolId } from '../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.schoolId) {
      console.error('[SchoolSchedule GET] Auth failed:', user);
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear');

    const { db } = await connectToDatabase();
    const schoolId = getNumericSchoolId(user.schoolId);

    console.log('[SchoolSchedule GET] Fetching for schoolId:', schoolId, 'academicYear:', academicYear);

    // Build query - if academicYear provided, filter by it, otherwise get all for school
    const query: { schoolId: number; academicYear?: string } = { schoolId };
    if (academicYear) {
      query.academicYear = academicYear;
    }

    console.log('[SchoolSchedule GET] Query:', query);

    let result;
    if (academicYear) {
      // Get single schedule
      result = await db.collection('school_schedules').findOne(query);
      console.log('[SchoolSchedule GET] Single result:', result);
    } else {
      // Get all schedules for school
      result = await db.collection('school_schedules')
        .find(query)
        .sort({ academicYear: -1 })
        .toArray();
      console.log('[SchoolSchedule GET] All results count:', result.length);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[SchoolSchedule GET] Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.schoolId) {
      console.error('[SchoolSchedule] Auth failed:', user);
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[SchoolSchedule] Received body:', body);
    
    const { academicYear, startTime, endTime, periodDuration, holidays, breaks } = body;

    if (!academicYear || !startTime || !endTime || !periodDuration) {
      console.error('[SchoolSchedule] Missing fields:', { academicYear, startTime, endTime, periodDuration });
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: academicYear, startTime, endTime, periodDuration' 
      }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const schoolId = getNumericSchoolId(user.schoolId);
    console.log('[SchoolSchedule] Saving for schoolId:', schoolId, 'academicYear:', academicYear);

    // Use updateOne with upsert to create or update per school + academic year
    console.log('[SchoolSchedule] Using collection: school_schedules');
    const result = await db.collection('school_schedules').updateOne(
      { schoolId, academicYear },
      { 
        $set: {
          startTime,
          endTime,
          periodDuration: Number(periodDuration),
          holidays: holidays || {},
          breaks: breaks || [],
          updatedAt: new Date()
        },
        $setOnInsert: {
          schoolId,
          academicYear,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('[SchoolSchedule] Update result:', result);

    const message = result.upsertedCount > 0 
      ? 'School schedule created successfully' 
      : 'School schedule updated successfully';

    console.log('[SchoolSchedule] Success:', message);

    return NextResponse.json({ 
      success: true, 
      message,
      data: { schoolId, academicYear, modifiedCount: result.modifiedCount, upsertedCount: result.upsertedCount }
    });
  } catch (error) {
    console.error('[SchoolSchedule] POST error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error', error: String(error) }, { status: 500 });
  }
}
