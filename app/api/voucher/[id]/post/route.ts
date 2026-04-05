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

interface Voucher {
  _id: ObjectId;
  type: string;
  date: string;
  fiscalYear: string;
  refNo: string;
  narration: string;
  entries: VoucherEntry[];
  status: string;
  voucherNo: string;
  createdAt: Date;
  updatedAt: Date;
  postedAt?: Date;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase();
    
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid voucher ID' },
        { status: 400 }
      );
    }
    
    // Check if voucher exists and is in Draft status
    const voucher = await db.collection('vouchers').findOne({ _id: new ObjectId(id) }) as Voucher | null;
    
    if (!voucher) {
      return NextResponse.json(
        { success: false, error: 'Voucher not found' },
        { status: 404 }
      );
    }
    
    if (voucher.status !== 'Draft') {
      return NextResponse.json(
        { success: false, error: 'Voucher is already posted' },
        { status: 400 }
      );
    }
    
    // Validate voucher is balanced
    const totalDebit = voucher.entries.reduce((sum: number, entry: VoucherEntry) => sum + (entry.debit || 0), 0);
    const totalCredit = voucher.entries.reduce((sum: number, entry: VoucherEntry) => sum + (entry.credit || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        { success: false, error: 'Voucher is not balanced. Debit and credit must be equal.' },
        { status: 400 }
      );
    }
    
    // Update voucher status to Posted
    const result = await db.collection('vouchers').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status: 'Posted',
          postedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to update voucher' },
        { status: 500 }
      );
    }
    
    // Get updated voucher
    const updatedVoucher = await db.collection('vouchers').findOne({ _id: new ObjectId(id) }) as Voucher | null;
    
    if (!updatedVoucher) {
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve updated voucher' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        _id: updatedVoucher._id,
        voucherNo: updatedVoucher.voucherNo,
        status: updatedVoucher.status,
        postedAt: updatedVoucher.postedAt
      }
    });
    
  } catch (error) {
    console.error('Post voucher error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
