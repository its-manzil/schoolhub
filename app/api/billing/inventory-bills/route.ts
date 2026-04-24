import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

let client: MongoClient | null = null;

async function getDB() {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI environment variable is not defined');
      throw new Error('Database configuration error: MONGODB_URI not defined');
    }
    try {
      client = new MongoClient(uri);
      await client.connect();
      console.log('Connected to MongoDB successfully');
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err);
      throw new Error('Failed to connect to database');
    }
  }
  return client.db('SchoolHub');
}

// GET - Fetch inventory bills with filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');
    const billId = searchParams.get('billId');
    const academicYear = searchParams.get('academicYear');
    const className = searchParams.get('className');
    const section = searchParams.get('section');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const db = await getDB();

    // If billId is provided, fetch single bill
    if (billId) {
      const bill = await db
        .collection('inventory_bills')
        .findOne({ _id: new ObjectId(billId) });

      if (!bill) {
        return NextResponse.json(
          { error: 'Bill not found' },
          { status: 404 }
        );
      }

      // Add BS date
      const billObj = { ...bill };
      if (billObj.createdAt) {
        const date = new Date(billObj.createdAt);
        const bsYear = date.getFullYear() + 57;
        const bsMonth = date.getMonth() + 1;
        const bsDay = date.getDate();
        billObj.createdAtBS = `${bsYear}-${bsMonth.toString().padStart(2, '0')}-${bsDay.toString().padStart(2, '0')}`;
      }

      return NextResponse.json({
        success: true,
        data: billObj
      });
    }

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Build query
    const query: Record<string, unknown> = { schoolId: parseInt(schoolId) };

    if (academicYear && academicYear !== 'all') {
      query.academicYear = academicYear;
    }

    if (className && className !== 'all') {
      query.className = className;
    }

    if (section && section !== 'all') {
      query.section = section;
    }

    // Status filter
    if (status && status !== 'all') {
      if (status === 'paid') {
        query.paymentStatus = 'paid';
      } else if (status === 'pending') {
        query.paymentStatus = { $ne: 'paid' };
      }
    }

    // Search filter (invoiceId, studentName, studentId)
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { invoiceId: searchRegex },
        { studentName: searchRegex },
        { studentId: searchRegex }
      ];
    }

    const bills = await db
      .collection('inventory_bills')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Add BS date to each bill
    const billsWithBSDate = bills.map(bill => {
      const billObj = { ...bill };
      // Convert createdAt to BS date string
      if (billObj.createdAt) {
        const date = new Date(billObj.createdAt);
        // Simple BS conversion - year + 57 for approximation
        // In production, use proper nepali-date-converter
        const bsYear = date.getFullYear() + 57;
        const bsMonth = date.getMonth() + 1;
        const bsDay = date.getDate();
        billObj.createdAtBS = `${bsYear}-${bsMonth.toString().padStart(2, '0')}-${bsDay.toString().padStart(2, '0')}`;
      }
      return billObj;
    });

    return NextResponse.json({
      success: true,
      data: billsWithBSDate
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bills';
    console.error('GET /api/billing/inventory-bills error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
