import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// Bill document interface
interface InventoryBill {
  _id?: ObjectId;
  schoolId: number;
  academicYear: string;
  studentId: string;
  studentName: string;
  className: string;
  section?: string;
  billType: 'PAN' | 'VAT';
  items: Array<{
    inventoryId: string;
    name: string;
    variant?: string;
    qty: number;
    rate: number;
    amount: number;
  }>;
  subTotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  paymentMode: string;
  paymentStatus: 'paid' | 'pending';
  chequeNo?: string;
  bankRefNo?: string;
  invoiceId?: string;
  createdAt: string;
}

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

// Generate invoice ID
function generateInvoiceId(schoolId: number): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `INV-${schoolId}-${timestamp}-${random}`;
}

// POST - Create new inventory bill
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      schoolId,
      academicYear,
      studentId,
      studentName,
      className,
      section,
      billType,
      items,
      subTotal,
      vatRate,
      vatAmount,
      totalAmount,
      paymentMode,
      chequeNo,
      bankRefNo
    } = body;

    // Validation
    if (!schoolId || !academicYear || !studentId || !studentName || !className) {
      return NextResponse.json(
        { error: 'School ID, academic year, student ID, student name, and class are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    if (!billType || !['PAN', 'VAT'].includes(billType)) {
      return NextResponse.json(
        { error: 'Valid bill type (PAN or VAT) is required' },
        { status: 400 }
      );
    }

    if (!paymentMode) {
      return NextResponse.json(
        { error: 'Payment mode is required' },
        { status: 400 }
      );
    }

    if (paymentMode === 'Cheque' && !chequeNo) {
      return NextResponse.json(
        { error: 'Cheque number is required for cheque payment' },
        { status: 400 }
      );
    }

    if (paymentMode === 'Bank' && !bankRefNo) {
      return NextResponse.json(
        { error: 'Bank reference number is required for bank payment' },
        { status: 400 }
      );
    }

    const db = await getDB();

    // Generate invoice ID
    const invoiceId = generateInvoiceId(schoolId);

    // Determine payment status based on payment mode
    // Cash and Bank = paid, Cheque = pending
    const paymentStatus: 'paid' | 'pending' =
      paymentMode === 'Cash' || paymentMode === 'Bank' ? 'paid' : 'pending';

    // Create bill document
    const billData: InventoryBill = {
      schoolId: parseInt(schoolId.toString()),
      academicYear,
      studentId,
      studentName,
      className,
      section: section || undefined,
      billType,
      items: items.map((item: {
        inventoryId: string;
        name: string;
        variant?: string;
        qty: number;
        rate: number;
        amount: number;
      }) => ({
        inventoryId: item.inventoryId,
        name: item.name,
        variant: item.variant,
        qty: parseInt(item.qty.toString()),
        rate: parseFloat(item.rate.toString()),
        amount: parseFloat(item.amount.toString())
      })),
      subTotal: parseFloat(subTotal.toString()),
      vatRate: parseInt(vatRate.toString()),
      vatAmount: parseFloat(vatAmount.toString()),
      totalAmount: parseFloat(totalAmount.toString()),
      paymentMode,
      paymentStatus,
      chequeNo: chequeNo || undefined,
      bankRefNo: bankRefNo || undefined,
      invoiceId,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection<InventoryBill>('inventory_bills').insertOne(billData);

    return NextResponse.json({
      success: true,
      data: {
        billId: result.insertedId.toString(),
        invoiceId,
        ...billData
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create bill';
    console.error('POST /api/billing/inventory-billing error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// GET - Fetch inventory bills
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');
    const billId = searchParams.get('billId');

    if (!schoolId && !billId) {
      return NextResponse.json(
        { error: 'School ID or Bill ID is required' },
        { status: 400 }
      );
    }

    const db = await getDB();

    // If billId is provided, fetch specific bill
    if (billId) {
      const bill = await db.collection<InventoryBill>('inventory_bills').findOne({
        _id: new ObjectId(billId)
      });

      if (!bill) {
        return NextResponse.json(
          { error: 'Bill not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: bill
      });
    }

    // Otherwise fetch bills by schoolId
    const query: Record<string, unknown> = { schoolId: parseInt(schoolId!) };

    const bills = await db
      .collection<InventoryBill>('inventory_bills')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: bills
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bills';
    console.error('GET /api/billing/inventory-billing error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
