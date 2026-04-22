import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';
import { verifyAuth, getNumericSchoolId } from '../../lib/auth';

// GET /api/academic/routine?className=&academicYear=
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.schoolId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('className');
    const academicYear = searchParams.get('academicYear');
    const schoolId = getNumericSchoolId(user.schoolId);

    // Handle className format - database stores "Class 10" but query might be "10"
    const classNameQuery = className ? (className.startsWith('Class') ? className : `Class ${className}`) : undefined;
    
    const query: { schoolId: number; className?: string; academicYear?: string } = { schoolId };
    if (classNameQuery) query.className = classNameQuery;
    if (academicYear) query.academicYear = academicYear;

    const routine = await db.collection('class_routines').findOne(query);
    
    // If not found with academicYear, try without it
    if (!routine && academicYear) {
      const queryNoYear = { schoolId, className: classNameQuery };
      const routineNoYear = await db.collection('class_routines').findOne(queryNoYear);
      if (routineNoYear) {
        // Fetch school schedule for breaks
        const schedule = await db.collection('school_schedules').findOne({ schoolId });
        if (schedule) {
          routineNoYear.breaks = schedule.breaks || [];
          routineNoYear.holidays = schedule.holidays || {};
        }
        return NextResponse.json({ success: true, data: routineNoYear });
      }
    }

    // If found, also fetch school schedule for breaks
    if (routine) {
      const schedule = await db.collection('school_schedules').findOne({ schoolId });
      if (schedule) {
        routine.breaks = schedule.breaks || [];
        routine.holidays = schedule.holidays || {};
      }
    }

    return NextResponse.json({ success: true, data: routine });
  } catch (error) {
    console.error('GET routine error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// POST /api/academic/routine
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.schoolId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { timeSlots, holidays } = body;
    let { className, academicYear, periods } = body;

    if (!className || !academicYear) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Basic sanitization
    className = className.trim().replace(/[<>]/g, '');
    academicYear = academicYear.trim().replace(/[<>]/g, '');
    interface PeriodInput {
      periodName: string;
      schedule: Record<string, string>;
    }

    if (periods && Array.isArray(periods)) {
      periods = (periods as PeriodInput[]).map((p) => ({
        ...p,
        periodName: (p.periodName || '').trim().replace(/[<>]/g, ''),
        schedule: Object.fromEntries(
          Object.entries(p.schedule || {}).map(([day, sub]) => [day, String(sub).trim().replace(/[<>]/g, '')])
        )
      }));
    }

    const { db } = await connectToDatabase();
    const schoolId = getNumericSchoolId(user.schoolId);

    // Get current global holidays to ensure they are synced
    const holidayDoc = await db.collection('academic_holidays').findOne({ schoolId, academicYear });
    const syncedHolidays = holidays || holidayDoc?.days || {
      Sunday: false, Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false
    };

    const routineData = {
      schoolId,
      academicYear,
      className,
      periods: periods || [],
      timeSlots: timeSlots || [],
      holidays: syncedHolidays,
      updatedAt: new Date()
    };

    const existing = await db.collection('class_routines').findOne({ schoolId, className, academicYear });
    if (existing) {
      await db.collection('class_routines').updateOne(
        { _id: existing._id },
        { $set: routineData }
      );
      return NextResponse.json({ 
        success: true, 
        message: 'Routine updated successfully',
        data: { _id: existing._id }
      });
    } else {
      const result = await db.collection('class_routines').insertOne({
        ...routineData,
        createdAt: new Date()
      });
      return NextResponse.json({ 
        success: true, 
        message: 'Routine created successfully',
        data: { _id: result.insertedId } 
      });
    }
  } catch (error) {
    console.error('POST routine error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// PUT /api/academic/routine/:id
// Since we might need to update by ID as well
export async function PUT(request: NextRequest) {
  // We can just use POST for UPSERT, but let's implement PUT if needed
  return POST(request);
}
