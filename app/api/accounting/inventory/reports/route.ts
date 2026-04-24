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

// GET - Fetch inventory sales report with profit calculation from inventory_bills
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolIdParam = searchParams.get('schoolId');
    const yearFilter = searchParams.get('year');

    // Require schoolId for data isolation
    if (!schoolIdParam) {
      console.warn('GET /inventory/reports: schoolId is required');
      return NextResponse.json({
        success: true,
        data: {
          bills: [],
          summary: {
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            totalItems: 0,
          }
        }
      });
    }

    const schoolId = String(schoolIdParam);

    const client = await getClient();
    const db = client.db('SchoolHub');
    const billsCollection = db.collection('inventory_bills');
    const inventoryCollection = db.collection('inventory');

    // Build query - handle both string and number schoolId for compatibility
    const schoolIdNum = parseInt(schoolId, 10);
    const query: Record<string, unknown> = {
      $or: [
        { schoolId: schoolId },
        { schoolId: schoolIdNum }
      ]
    };

    // Add year filter if provided
    if (yearFilter && yearFilter !== 'all') {
      const startDate = new Date(`${yearFilter}-01-01`);
      const endDate = new Date(`${parseInt(yearFilter) + 1}-01-01`);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    // Fetch all inventory bills for the school
    const bills = await billsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch all inventory items to get cost prices
    const inventoryItems = await inventoryCollection
      .find({
        $or: [
          { schoolId: schoolId },
          { schoolId: schoolIdNum }
        ]
      })
      .toArray();

    // Create a map of inventoryId -> purchasePrice (cp)
    const inventoryPriceMap = new Map<string, number>();
    inventoryItems.forEach(item => {
      const itemId = item._id?.toString();
      if (itemId) {
        inventoryPriceMap.set(itemId, item.purchasePrice || 0);
      }
    });

    // Process bills and calculate profit for each item
    const processedBills = bills.map(bill => {
      const billObj = bill as unknown as Record<string, unknown>;
      const billItems = (bill.items || []) as Array<{
        inventoryId?: string;
        name?: string;
        rate?: number;
        qty?: number;
        variant?: string;
        amount?: number;
      }>;

      const items = billItems.map(item => {
        const inventoryId = item.inventoryId || '';
        const rate = item.rate || 0;
        const qty = item.qty || 0;
        const cp = inventoryPriceMap.get(inventoryId) || 0;
        const revenue = rate * qty;
        const cost = cp * qty;
        const profit = revenue - cost;

        return {
          ...item,
          inventoryId,
          cp,
          revenue,
          cost,
          profit,
        };
      });

      // Calculate bill totals
      const billRevenue = items.reduce((sum, item) => sum + item.revenue, 0);
      const billCost = items.reduce((sum, item) => sum + item.cost, 0);
      const billProfit = billRevenue - billCost;

      return {
        ...billObj,
        _id: bill._id?.toString(),
        items,
        billRevenue,
        billCost,
        billProfit,
      };
    });

    // Calculate summary statistics
    const summary = processedBills.reduce((acc, bill) => {
      const items = bill.items || [];
      const paymentStatus = (bill as unknown as Record<string, string>).paymentStatus;
      const paidItems = paymentStatus === 'paid' ? items : [];

      return {
        totalRevenue: acc.totalRevenue + paidItems.reduce((sum, item) => sum + item.revenue, 0),
        totalCost: acc.totalCost + paidItems.reduce((sum, item) => sum + item.cost, 0),
        totalItems: acc.totalItems + items.reduce((sum, item) => sum + (item.qty || 0), 0),
        totalBills: acc.totalBills + 1,
        paidBills: acc.paidBills + (paymentStatus === 'paid' ? 1 : 0),
        pendingBills: acc.pendingBills + (paymentStatus !== 'paid' ? 1 : 0),
      };
    }, {
      totalRevenue: 0,
      totalCost: 0,
      totalItems: 0,
      totalBills: 0,
      paidBills: 0,
      pendingBills: 0,
    });

    const totalProfit = summary.totalRevenue - summary.totalCost;

    return NextResponse.json({
      success: true,
      data: {
        bills: processedBills,
        summary: {
          ...summary,
          totalProfit,
        }
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
