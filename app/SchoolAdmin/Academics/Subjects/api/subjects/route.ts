import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/db';
import { verifyAuth, getNumericSchoolId } from '../../lib/auth';
import { ObjectId } from 'mongodb';

// GET /api/academic/subjects?className=&academicYear=
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

    const query: { schoolId: number; className?: string; academicYear?: string } = { schoolId };
    if (className) query.className = className;
    if (academicYear) query.academicYear = academicYear;

    const subjects = await db.collection('subjects').find(query).toArray();

    return NextResponse.json({ success: true, data: subjects });
  } catch (error) {
    console.error('GET subjects error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// POST /api/academic/subjects
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || !user.schoolId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subjects } = body;
    const sanitizedClassName = (body.className || '').trim().replace(/[<>]/g, '');
    const sanitizedAcademicYear = (body.academicYear || '').trim().replace(/[<>]/g, '');

    if (!sanitizedClassName || !sanitizedAcademicYear || !subjects || !Array.isArray(subjects)) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

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

    // Prevent duplicate subjects per class/year
    const existing = await db.collection('subjects').findOne({ 
      schoolId, 
      className: sanitizedClassName, 
      academicYear: sanitizedAcademicYear 
    });

    if (existing) {
      // If already exists, update the subjects list
      await db.collection('subjects').updateOne(
        { _id: existing._id },
        { 
          $set: { 
            subjects: sanitizedSubjects, 
            updatedAt: new Date() 
          } 
        }
      );
      return NextResponse.json({ success: true, message: 'Subjects updated successfully' });
    } else {
      const result = await db.collection('subjects').insertOne({
        schoolId,
        className: sanitizedClassName,
        academicYear: sanitizedAcademicYear,
        subjects: sanitizedSubjects,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Subjects added successfully',
        data: { _id: result.insertedId } 
      });
    }
  } catch (error) {
    console.error('POST subjects error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
