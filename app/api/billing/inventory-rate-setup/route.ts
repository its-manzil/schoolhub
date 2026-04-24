import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// Inventory document interface
interface Inventory {
  _id?: ObjectId;
  schoolId: number;
  academicYear: string;
  name: string;
  hasVariants: boolean;
  price?: number;
  variants?: Array<{
    label: string;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// User interface for password verification
interface User {
  _id: ObjectId;
  password: string;
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

// GET - Fetch inventories by schoolId and academicYear
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');
    const academicYear = searchParams.get('academicYear');

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    const db = await getDB();

    // Build query
    const query: Record<string, unknown> = { schoolId: parseInt(schoolId) };

    if (academicYear && academicYear !== '') {
      query.academicYear = academicYear;
    }

    const inventories = await db
      .collection<Inventory>('inventory_rates')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: inventories
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch inventories';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST - Create new inventory
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { schoolId, academicYear, name, hasVariants, price, variants } = body;

    // Validation
    if (!schoolId || !academicYear || !name) {
      return NextResponse.json(
        { error: 'School ID, academic year, and inventory name are required' },
        { status: 400 }
      );
    }

    if (hasVariants === undefined || hasVariants === null) {
      return NextResponse.json(
        { error: 'Has Variants field is required' },
        { status: 400 }
      );
    }

    if (!hasVariants && (price === undefined || price === null)) {
      return NextResponse.json(
        { error: 'Price is required for non-variant inventories' },
        { status: 400 }
      );
    }

    if (hasVariants && (!variants || variants.length === 0)) {
      return NextResponse.json(
        { error: 'At least one variant is required when Has Variants is enabled' },
        { status: 400 }
      );
    }

    const db = await getDB();

    // Check for duplicate entry (same name + academicYear + schoolId)
    const existingInventory = await db.collection<Inventory>('inventory_rates').findOne({
      schoolId: parseInt(schoolId),
      academicYear,
      name: { $regex: new RegExp(`^${name}$`, 'i') } // Case-insensitive match
    });

    if (existingInventory) {
      return NextResponse.json(
        { error: `Inventory "${name}" already exists for academic year ${academicYear}` },
        { status: 409 }
      );
    }

    // Create inventory document
    const inventoryData: Inventory = {
      schoolId: parseInt(schoolId),
      academicYear,
      name,
      hasVariants,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (hasVariants) {
      inventoryData.variants = variants.map((v: { label: string; price: number }) => ({
        label: v.label,
        price: parseFloat(v.price.toString())
      }));
    } else {
      inventoryData.price = parseFloat(price.toString());
    }

    const result = await db.collection<Inventory>('inventory_rates').insertOne(inventoryData);

    return NextResponse.json({
      success: true,
      data: {
        _id: result.insertedId,
        ...inventoryData
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create inventory';
    console.error('POST /api/billing/inventory-rate-setup error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT - Update inventory with password verification
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, schoolId, academicYear, name, hasVariants, price, variants, password } = body;

    // Validation
    if (!id || !schoolId || !password) {
      return NextResponse.json(
        { error: 'Inventory ID, school ID, and password are required' },
        { status: 400 }
      );
    }

    if (!academicYear || !name) {
      return NextResponse.json(
        { error: 'Academic year and inventory name are required' },
        { status: 400 }
      );
    }

    if (hasVariants === undefined || hasVariants === null) {
      return NextResponse.json(
        { error: 'Has Variants field is required' },
        { status: 400 }
      );
    }

    if (!hasVariants && (price === undefined || price === null)) {
      return NextResponse.json(
        { error: 'Price is required for non-variant inventories' },
        { status: 400 }
      );
    }

    if (hasVariants && (!variants || variants.length === 0)) {
      return NextResponse.json(
        { error: 'At least one variant is required when Has Variants is enabled' },
        { status: 400 }
      );
    }

    const db = await getDB();

    // Verify password
    const user = await db.collection<User>('users').findOne({
      schoolId: parseInt(schoolId),
      role: { $in: ['schooladmin', 'billing'] }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Simple password comparison (in production, use bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Check for duplicate entry (excluding current inventory)
    const existingInventory = await db.collection<Inventory>('inventory_rates').findOne({
      _id: { $ne: new ObjectId(id) },
      schoolId: parseInt(schoolId),
      academicYear,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingInventory) {
      return NextResponse.json(
        { error: `Inventory "${name}" already exists for academic year ${academicYear}` },
        { status: 409 }
      );
    }

    // Build update document
    const updateData: Partial<Inventory> = {
      academicYear,
      name,
      hasVariants,
      updatedAt: new Date().toISOString()
    };

    if (hasVariants) {
      updateData.variants = variants.map((v: { label: string; price: number }) => ({
        label: v.label,
        price: parseFloat(v.price.toString())
      }));
      updateData.price = undefined;
    } else {
      updateData.price = parseFloat(price.toString());
      updateData.variants = undefined;
    }

    const result = await db.collection<Inventory>('inventory_rates').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Inventory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory updated successfully'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update inventory';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE - Delete inventory
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Inventory ID is required' },
        { status: 400 }
      );
    }

    const db = await getDB();

    const result = await db.collection<Inventory>('inventory_rates').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Inventory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory deleted successfully'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete inventory';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
