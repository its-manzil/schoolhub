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

// GET - Fetch inventory sales report with profit calculation from inventory_transactions
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolIdParam = searchParams.get('schoolId');
    const yearFilter = searchParams.get('year');
    const monthFilter = searchParams.get('month');

    // Require schoolId for data isolation
    if (!schoolIdParam) {
      console.warn('GET /inventory/reports: schoolId is required');
      return NextResponse.json({
        success: true,
        data: {
          transactions: [],
          summary: {
            totalSales: 0,
            totalProfit: 0,
            totalItemsSold: 0,
          }
        }
      });
    }

    const schoolId = String(schoolIdParam);

    const client = await getClient();
    const db = client.db('SchoolHub');
    const transactionsCollection = db.collection('inventory_transactions');

    // Build query - handle both string and number schoolId for compatibility
    const schoolIdNum = parseInt(schoolId, 10);
    const query: Record<string, unknown> = {
      type: 'sale',
      $or: [
        { schoolId: schoolId },
        { schoolId: schoolIdNum }
      ]
    };

    // Add BS date filter based on year and optional month
    if (yearFilter && yearFilter !== 'all') {
      if (monthFilter && monthFilter !== 'all') {
        // Filter by specific year and month: bsDate starts with "YYYY-MM"
        const monthPadded = monthFilter.padStart(2, '0');
        query.bsDate = { $regex: `^${yearFilter}-${monthPadded}` };
      } else {
        // Filter by year only: bsDate starts with "YYYY"
        query.bsDate = { $regex: `^${yearFilter}` };
      }
    }

    // Fetch all sale transactions for the school
    const transactions = await transactionsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate summary statistics from transactions
    // totalSales = sum(sp * qty), totalProfit = sum(profit), totalItemsSold = sum(qty)
    const summary = transactions.reduce((acc, transaction) => {
      const sp = transaction.sp || 0;
      const qty = transaction.qty || 0;
      const profit = transaction.profit || 0;

      return {
        totalSales: acc.totalSales + (sp * qty),
        totalProfit: acc.totalProfit + profit,
        totalItemsSold: acc.totalItemsSold + qty,
      };
    }, {
      totalSales: 0,
      totalProfit: 0,
      totalItemsSold: 0,
    });

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        summary
      }
    });
  } catch (error) {
    console.error('Error fetching inventory report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory report' },
      { status: 500 }
    );
  }
}
