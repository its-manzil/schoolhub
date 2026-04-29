import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch all subscriptions
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const subscriptions = await db.collection('subscriptions').find({}).toArray();
    
    return NextResponse.json({ 
      success: true, 
      data: subscriptions 
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolName, plan, status, startDate, endDate, paymentStatus, amount } = body;

    if (!schoolName || !plan || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    const newSubscription = {
      schoolName,
      plan,
      status,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date().toISOString(),
      paymentStatus: paymentStatus || 'pending',
      amount: amount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('subscriptions').insertOne(newSubscription);

    return NextResponse.json({
      success: true,
      message: 'Subscription created successfully',
      data: { _id: result.insertedId, ...newSubscription }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// PATCH - Update subscription status or plan
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, plan, paymentStatus, amount, endDate } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (plan) updateData.plan = plan;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (amount !== undefined) updateData.amount = amount;
    if (endDate) updateData.endDate = endDate;

    const result = await db.collection('subscriptions').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// DELETE - Remove subscription
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    const result = await db.collection('subscriptions').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
