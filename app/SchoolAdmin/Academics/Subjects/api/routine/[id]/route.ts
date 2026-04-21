import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';
import { verifyAuth, getNumericSchoolId } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

// PUT /api/academic/routine/:id
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.schoolId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { periods, timeSlots, holidays } = body;

    const { db } = await connectToDatabase();
    const schoolId = getNumericSchoolId(user.schoolId);

    interface RoutineUpdateData {
      periods?: unknown[];
      timeSlots?: unknown[];
      holidays?: Record<string, boolean>;
      updatedAt: Date;
    }

    const updateData: RoutineUpdateData = {
      updatedAt: new Date()
    };
    if (periods) updateData.periods = periods;
    if (timeSlots) updateData.timeSlots = timeSlots;
    if (holidays) updateData.holidays = holidays;

    const result = await db.collection('class_routines').updateOne(
      { _id: new ObjectId(id), schoolId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'Routine not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Routine updated successfully' });
  } catch (error) {
    console.error('PUT routine error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
