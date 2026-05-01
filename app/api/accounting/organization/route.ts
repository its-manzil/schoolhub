import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET /api/accounting/organization?schoolId=XXXX
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      return NextResponse.json({ error: 'schoolId is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const school = await db.collection('schools').findOne({ 
      schoolId: parseInt(schoolId) 
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    return NextResponse.json(school);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch organization';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/accounting/organization
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { schoolId, phone, email, pan, vat } = body;

    if (!schoolId) {
      return NextResponse.json({ error: 'schoolId is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const updateData: Record<string, unknown> = {
      'accounting.phone': phone || '',
      'accounting.email': email || '',
      'accounting.pan': pan || '',
      'accounting.vat': vat || '',
      updatedAt: new Date()
    };

    const result = await db.collection('schools').updateOne(
      { schoolId: parseInt(schoolId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const updatedSchool = await db.collection('schools').findOne({ 
      schoolId: parseInt(schoolId) 
    });

    return NextResponse.json(updatedSchool);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update organization';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
