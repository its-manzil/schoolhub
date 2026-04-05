import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, ObjectId } from 'mongodb';

// MongoDB connection singleton
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  await client.connect();
  
  const db = client.db('schoolhub');
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

interface VoucherEntry {
  ledgerId: string;
  ledgerName: string;
  debit: number;
  credit: number;
  description: string;
}

interface VoucherData {
  type: string;
  date: string;
  fiscalYear?: string;
  refNo?: string;
  narration?: string;
  voucherNo?: string;
  entries: VoucherEntry[];
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    const body: VoucherData = await request.json();
    
    // Validate required fields
    if (!body.type || !body.date || !body.entries || !Array.isArray(body.entries)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: type, date, entries' },
        { status: 400 }
      );
    }
    
    // Validate entries
    if (body.entries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one entry is required' },
        { status: 400 }
      );
    }
    
    // Check if entries have valid ledger data
    for (const entry of body.entries) {
      if (!entry.ledgerName || (!entry.debit && !entry.credit)) {
        return NextResponse.json(
          { success: false, error: 'Each entry must have ledgerName and either debit or credit amount' },
          { status: 400 }
        );
      }
    }
    
    // Prepare voucher document
    const voucher = {
      type: body.type,
      date: body.date,
      fiscalYear: body.fiscalYear || '2082/83',
      refNo: body.refNo || '',
      narration: body.narration || '',
      entries: body.entries.map((entry: VoucherEntry) => ({
        ledgerId: entry.ledgerId || new ObjectId().toString(),
        ledgerName: entry.ledgerName,
        debit: Number(entry.debit) || 0,
        credit: Number(entry.credit) || 0,
        description: entry.description || ''
      })),
      status: 'Draft',
      voucherNo: body.voucherNo || generateVoucherNumber(body.type),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert into database
    const result = await db.collection('vouchers').insertOne(voucher);
    
    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId.toString(),
        ...voucher
      }
    });
    
  } catch (error) {
    console.error('Voucher creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    
    // Build query
    const query: Record<string, string> = {};
    if (type) query.type = type;
    if (status) query.status = status;
    
    // Get vouchers with pagination
    const skip = (page - 1) * limit;
    const vouchers = await db.collection('vouchers')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await db.collection('vouchers').countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: vouchers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Voucher listing error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateVoucherNumber(type: string): string {
  const prefixes: Record<string, string> = {
    'JV': 'JV',
    'RCT': 'RCT', 
    'PR': 'PR',
    'CN': 'CN'
  };
  
  const prefix = prefixes[type] || 'VO';
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${timestamp}`;
}
