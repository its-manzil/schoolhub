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

// GET - Fetch distinct academic years from bsDate field
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolIdParam = searchParams.get('schoolId');

    // Require schoolId for data isolation
    if (!schoolIdParam) {
      console.warn('GET /inventory/years: schoolId is required');
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const schoolId = String(schoolIdParam);

    const client = await getClient();
    const db = client.db('SchoolHub');
    const transactionsCollection = db.collection('inventory_transactions');

    // Build query - handle both string and number schoolId for compatibility
    const schoolIdNum = parseInt(schoolId, 10);
    const query: Record<string, unknown> = {
      bsDate: { $exists: true, $ne: null },
      $or: [
        { schoolId: schoolId },
        { schoolId: schoolIdNum }
      ]
    };

    // Use distinct to get unique bsDate values
    const distinctDates = await transactionsCollection.distinct('bsDate', query);

    // Extract years from bsDate (format: "YYYY-MM-DD", extract "YYYY")
    const years = distinctDates
      .filter((date): date is string => typeof date === 'string' && date.includes('-'))
      .map(date => date.split('-')[0]);

    // Remove duplicates using Set and sort descending
    const uniqueYears = Array.from(new Set(years)).sort((a, b) => parseInt(b) - parseInt(a));

    return NextResponse.json({
      success: true,
      data: uniqueYears
    });
  } catch (error) {
    console.error('Error fetching academic years:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic years' },
      { status: 500 }
    );
  }
}
