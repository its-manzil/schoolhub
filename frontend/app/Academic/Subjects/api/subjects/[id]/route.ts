import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';
import { verifyAuth, getNumericSchoolId } from '../../../lib/auth';
import { ObjectId } from 'mongodb';

// PUT /api/academic/subjects/:id
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.schoolId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { subjects } = body;
    let { className, academicYear } = body;

    if (!subjects || !Array.isArray(subjects)) {
      return NextResponse.json({ success: false, message: 'Missing subjects data' }, { status: 400 });
    }

    // Basic sanitization
    if (className) className = className.trim().replace(/[<>]/g, '');
    if (academicYear) academicYear = academicYear.trim().replace(/[<>]/g, '');

    interface SubjectInput {
      name: string;
      type: 'Primary' | 'Minor' | 'Optional';
      creditHours?: number;
      description?: string;
    }

    const sanitizedSubjects = (subjects as SubjectInput[]).map((s) => ({
      name: (s.name || '').trim().replace(/[<>]/g, ''),
      type: s.type,
      creditHours: s.creditHours,
      description: (s.description || '').trim().replace(/[<>]/g, '')
    }));

    // Prevent duplicate subject names in the array
    const names = sanitizedSubjects.map(s => s.name.toLowerCase());
    const hasDuplicates = names.some((name, index) => names.indexOf(name) !== index);
    if (hasDuplicates) {
      return NextResponse.json({ success: false, message: 'Subject names must be unique within a class' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const schoolId = getNumericSchoolId(user.schoolId);

    interface SubjectUpdateData {
      subjects: {
        name: string;
        type: 'Primary' | 'Minor' | 'Optional';
        creditHours?: number;
        description?: string;
      }[];
      updatedAt: Date;
      className?: string;
      academicYear?: string;
    }

    const updateData: SubjectUpdateData = {
      subjects: sanitizedSubjects,
      updatedAt: new Date()
    };
    if (className) updateData.className = className;
    if (academicYear) updateData.academicYear = academicYear;

    const result = await db.collection('subjects').updateOne(
      { _id: new ObjectId(id), schoolId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'Subject record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Subjects updated successfully' });
  } catch (error) {
    console.error('PUT subjects error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// DELETE /api/academic/subjects/:id
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.schoolId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { db } = await connectToDatabase();
    const schoolId = getNumericSchoolId(user.schoolId);

    const result = await db.collection('subjects').deleteOne({
      _id: new ObjectId(id),
      schoolId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: 'Subject record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Subject record deleted successfully' });
  } catch (error) {
    console.error('DELETE subjects error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
