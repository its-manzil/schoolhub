import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// Bill document interface
interface Bill {
  _id: string;
  invoiceId: string;
  schoolId: number;
  studentId: string;
  studentName: string;
  className: string;
  academicYear: string;
  components: Array<{
    name: string;
    qty: number;
    rate: number;
    amount: number;
  }>;
  subTotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paymentMode: 'cash' | 'online' | 'cheque';
  paymentStatus: 'paid' | 'pending' | 'cheque_pending';
  chequeNo?: string;
  createdAt: string;
  createdAtBS: string;
  isLocked: boolean;
  schoolPanVat?: string;
}

let client: MongoClient | null = null;

async function getDB() {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not defined');
    }
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db('SchoolHub');
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');
    const academicYear = searchParams.get('academicYear');
    const className = searchParams.get('className');
    const section = searchParams.get('section');
    const status = searchParams.get('status');

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const db = await getDB();

    // Build query
    const query: Record<string, unknown> = { schoolId: parseInt(schoolId) };

    if (academicYear && academicYear !== '') {
      query.academicYear = academicYear;
    }

    if (className && className !== 'all') {
      query.className = className;
    }

    if (section && section !== 'all') {
      query.section = section;
    }

    if (status === 'paid') {
      query.paymentStatus = 'paid';
    }

    if (status === 'pending') {
      query.paymentStatus = { $in: ['pending', 'cheque_pending'] };
    }

    const bills = await db
      .collection<Bill>('bills')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate summary with typed parameters
    const totalReceived = bills
      .filter((b: Bill) => b.paymentStatus === 'paid')
      .reduce((sum: number, b: Bill) => sum + (b.totalAmount || 0), 0);

    const totalPending = bills
      .filter((b: Bill) => b.paymentStatus !== 'paid')
      .reduce((sum: number, b: Bill) => sum + (b.totalAmount || 0), 0);

    const totalBills = bills.length;

    return NextResponse.json({
      success: true,
      data: bills,
      summary: {
        totalReceived,
        totalPending,
        totalBills
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch collection report';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
