import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET - Fetch all subscriptions from schools table
export async function GET() {
  try {
    console.log('API: Connecting to database...');
    const { db } = await connectToDatabase();
    console.log('API: Database connected, querying schools...');
    
    // Fetch schools with subscription data
    const schools = await db.collection('schools').find({}).toArray();
    console.log('API: Found', schools.length, 'schools');
    
    // Transform school data to subscription format
    const subscriptions = schools.map(school => {
      const sub = school.subscription || {};
      return {
        _id: school._id.toString(),
        schoolId: school.schoolId,
        schoolName: school.name || 'Unknown School',
        plan: sub.years ? `${sub.years} Year${sub.years > 1 ? 's' : ''}` : 'Basic',
        status: sub.isActive ? 'active' : (school.status || 'inactive'),
        startDate: sub.subscribedDate || school.createdAt || new Date().toISOString(),
        endDate: sub.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        paymentStatus: sub.totalPaid >= sub.amount ? 'paid' : 'pending',
        amount: sub.amount || 0,
        totalPaid: sub.totalPaid || 0,
        remainingDays: sub.remainingDays || 0,
        history: sub.history || []
      };
    });
    
    console.log('API: Transformed', subscriptions.length, 'subscriptions');
    
    return NextResponse.json({ 
      success: true, 
      data: subscriptions 
    });
  } catch (error) {
    console.error('API Error fetching subscriptions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

// POST - Create or update subscription for a school
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolId, schoolName, plan, status, startDate, endDate, paymentStatus, amount, years } = body;

    if (!schoolId || !plan || !status) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields (schoolId, plan, status)' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Calculate subscription dates
    const now = new Date();
    const subscriptionYears = years || parseInt(plan.match(/(\d+)/)?.[1]) || 1;
    const expiryDate = endDate || new Date(now.getTime() + subscriptionYears * 365 * 24 * 60 * 60 * 1000).toISOString();
    
    const subscriptionData = {
      years: subscriptionYears,
      amount: amount || 0,
      subscribedDate: startDate || now.toISOString(),
      expiryDate: expiryDate,
      isActive: status === 'active',
      remainingDays: Math.ceil((new Date(expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      totalPaid: paymentStatus === 'paid' ? (amount || 0) : 0,
      history: [{
        years: subscriptionYears,
        amount: amount || 0,
        subscribedDate: startDate || now.toISOString(),
        expiryDate: expiryDate,
        paymentDate: paymentStatus === 'paid' ? now.toISOString() : null,
        transactionId: `TXN${Date.now()}`
      }]
    };

    const result = await db.collection('schools').updateOne(
      { schoolId: schoolId },
      { 
        $set: {
          name: schoolName,
          subscription: subscriptionData,
          status: status,
          updatedAt: now.toISOString()
        },
        $setOnInsert: {
          createdAt: now.toISOString()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: result.upsertedCount > 0 ? 'School and subscription created successfully' : 'Subscription updated successfully',
      data: { schoolId, subscription: subscriptionData }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// PATCH - Update subscription within school document
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, plan, paymentStatus, amount, endDate } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'School ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Build subscription update object
    const subscriptionUpdate: Record<string, unknown> = {};
    
    if (status !== undefined) {
      // Update isActive based on status
      subscriptionUpdate['subscription.isActive'] = status === 'active';
      // Also update school status
      subscriptionUpdate['status'] = status;
    }
    if (plan) {
      // Extract years from plan string (e.g., "4 Years" -> 4)
      const yearsMatch = plan.match(/(\d+)/);
      if (yearsMatch) {
        subscriptionUpdate['subscription.years'] = parseInt(yearsMatch[1]);
      }
    }
    if (amount !== undefined) subscriptionUpdate['subscription.amount'] = amount;
    if (endDate) subscriptionUpdate['subscription.expiryDate'] = endDate;
    if (paymentStatus) {
      // Update totalPaid based on paymentStatus
      if (paymentStatus === 'paid') {
        const school = await db.collection('schools').findOne({ _id: new ObjectId(id) });
        subscriptionUpdate['subscription.totalPaid'] = school?.subscription?.amount || amount || 0;
      }
    }
    
    subscriptionUpdate['updatedAt'] = new Date().toISOString();

    const result = await db.collection('schools').updateOne(
      { _id: new ObjectId(id) },
      { $set: subscriptionUpdate }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'School not found' },
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

// DELETE - Deactivate subscription within school document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'School ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Instead of deleting the school, we deactivate the subscription
    const result = await db.collection('schools').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          'subscription.isActive': false,
          'status': 'inactive',
          'updatedAt': new Date().toISOString()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'School not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating subscription:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to deactivate subscription' },
      { status: 500 }
    );
  }
}
