import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

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

// GET - Fetch all inventory items
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');

    // Require schoolId for data isolation
    if (!schoolId) {
      console.warn('GET /inventory: schoolId is required');
      return NextResponse.json([]);
    }

    const client = await getClient();
    const db = client.db('SchoolHub');
    const collection = db.collection('inventory');

    const items = await collection.find({ schoolId }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

// POST - Create new inventory item
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      schoolId,
      academicYear,
      name,
      category,
      unit,
      hasVariants,
      variants,
      totalStock,
      reorderLevel,
      supplier,
      purchasePrice,
      sellingPrice,
    } = body;

    const client = await getClient();
    const db = client.db('SchoolHub');
    const collection = db.collection('inventory');

    if (!schoolId) {
      return NextResponse.json(
        { error: 'schoolId is required' },
        { status: 400 }
      );
    }

    const newItem = {
      schoolId: String(schoolId),
      academicYear: academicYear || new Date().getFullYear().toString(),
      name,
      category,
      unit: unit || 'pcs',
      hasVariants: hasVariants || false,
      variants: variants || [],
      totalStock: totalStock || 0,
      totalSold: 0,
      totalDamaged: 0,
      reorderLevel: reorderLevel || 10,
      supplier: supplier || '',
      purchasePrice: purchasePrice || 0,
      sellingPrice: sellingPrice || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newItem);

    return NextResponse.json(
      { ...newItem, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}

// PUT - Update inventory item
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const client = await getClient();
    const db = client.db('SchoolHub');
    const collection = db.collection('inventory');

    const updateDoc = {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      updateDoc
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}
