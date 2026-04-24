import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client: MongoClient | null = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(MONGODB_URI as string);
    await client.connect();
  }
  return client;
}

// GET - Fetch transaction history
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const inventoryId = searchParams.get('inventoryId');
    const schoolId = searchParams.get('schoolId');
    const type = searchParams.get('type');

    // Require schoolId for data isolation
    if (!schoolId) {
      console.warn('GET /inventory/transactions: schoolId is required');
      return NextResponse.json([]);
    }

    const client = await getClient();
    const db = client.db('SchoolHub');
    const collection = db.collection('inventory_transactions');

    const query: Record<string, string> = { schoolId };
    if (inventoryId) query.inventoryId = inventoryId;
    if (type) query.type = type;

    const transactions = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
