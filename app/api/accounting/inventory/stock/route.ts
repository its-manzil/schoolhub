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

// POST - Handle stock transactions (in/out/damage/sale)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      inventoryId,
      schoolId,
      type, // 'purchase', 'sale', 'damage', 'adjustment'
      qty,
      cp, // cost price
      sp, // selling price
      referenceId, // billId if from billing
      paymentStatus, // 'paid' or 'pending' for sales
      person,
      purpose,
      notes,
    } = body;

    if (!inventoryId || !type || !qty) {
      return NextResponse.json(
        { error: 'Missing required fields: inventoryId, type, qty' },
        { status: 400 }
      );
    }

    const client = await getClient();
    const db = client.db('SchoolHub');
    const inventoryCollection = db.collection('inventory');
    const transactionsCollection = db.collection('inventory_transactions');

    // Get current inventory item
    const item = await inventoryCollection.findOne({ _id: new ObjectId(inventoryId) });
    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    const beforeStock = item.totalStock || 0;
    let afterStock = beforeStock;
    let profit = 0;

    // Handle different transaction types
    switch (type) {
      case 'purchase':
        // Stock In - increase stock
        afterStock = beforeStock + qty;
        await inventoryCollection.updateOne(
          { _id: new ObjectId(inventoryId) },
          {
            $set: { updatedAt: new Date() },
            $inc: { totalStock: qty },
          }
        );
        break;

      case 'sale':
        // Sale - only reduce stock if payment is completed
        if (paymentStatus === 'paid') {
          afterStock = beforeStock - qty;
          profit = (sp - (cp || item.purchasePrice || 0)) * qty;
          await inventoryCollection.updateOne(
            { _id: new ObjectId(inventoryId) },
            {
              $set: { updatedAt: new Date() },
              $inc: { totalStock: -qty, totalSold: qty },
            }
          );
        } else {
          // For pending sales, don't reduce stock yet
          afterStock = beforeStock;
        }
        break;

      case 'damage':
        // Damage - reduce stock and track damaged
        afterStock = beforeStock - qty;
        await inventoryCollection.updateOne(
          { _id: new ObjectId(inventoryId) },
          {
            $set: { updatedAt: new Date() },
            $inc: { totalStock: -qty, totalDamaged: qty },
          }
        );
        break;

      case 'adjustment':
        // Adjustment - can be positive or negative
        afterStock = beforeStock + qty;
        await inventoryCollection.updateOne(
          { _id: new ObjectId(inventoryId) },
          {
            $set: { updatedAt: new Date() },
            $inc: { totalStock: qty },
          }
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid transaction type' },
          { status: 400 }
        );
    }

    // Create transaction record
    const transaction = {
      inventoryId,
      schoolId: schoolId || item.schoolId || 'default-school',
      type,
      qty,
      beforeStock,
      afterStock,
      cp: cp || item.purchasePrice || 0,
      sp: sp || item.sellingPrice || 0,
      profit,
      referenceId: referenceId || null,
      paymentStatus: paymentStatus || null,
      person: person || null,
      purpose: purpose || null,
      notes: notes || null,
      createdAt: new Date(),
    };

    const result = await transactionsCollection.insertOne(transaction);

    return NextResponse.json(
      { ...transaction, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing stock transaction:', error);
    return NextResponse.json(
      { error: 'Failed to process stock transaction' },
      { status: 500 }
    );
  }
}
