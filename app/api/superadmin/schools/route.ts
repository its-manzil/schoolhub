import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET - Fetch schools summary for dashboard
export async function GET() {
  try {
    console.log('API: Fetching schools summary...');
    const { db } = await connectToDatabase();
    
    // Get total schools count
    const totalSchools = await db.collection('schools').countDocuments();
    
    // Get active schools count
    const activeSchools = await db.collection('schools').countDocuments({
      $or: [
        { 'subscription.isActive': true },
        { status: 'active' }
      ]
    });
    
    // Get schools created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSchools = await db.collection('schools').countDocuments({
      createdAt: { $gte: thirtyDaysAgo.toISOString() }
    });
    
    // Get recent schools list (last 5)
    const recentSchoolsList = await db.collection('schools')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .project({
        schoolId: 1,
        name: 1,
        status: 1,
        'subscription.isActive': 1,
        'subscription.expiryDate': 1,
        createdAt: 1,
        updatedAt: 1
      })
      .toArray();
    
    // Get status breakdown
    const statusBreakdown = await db.collection('schools').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    // Get subscription status breakdown
    const subscriptionBreakdown = await db.collection('schools').aggregate([
      {
        $group: {
          _id: '$subscription.isActive',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    console.log('API: Schools summary fetched', {
      total: totalSchools,
      active: activeSchools,
      recent: recentSchools
    });
    
    return NextResponse.json({
      success: true,
      data: {
        totalSchools,
        activeSchools,
        recentSchools,
        recentSchoolsList: recentSchoolsList.map(school => ({
          _id: school._id.toString(),
          schoolId: school.schoolId,
          name: school.name,
          status: school.status,
          subscriptionActive: school.subscription?.isActive || false,
          expiryDate: school.subscription?.expiryDate,
          createdAt: school.createdAt,
          updatedAt: school.updatedAt
        })),
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item._id || 'unknown'] = item.count;
          return acc;
        }, {} as Record<string, number>),
        subscriptionBreakdown: {
          active: subscriptionBreakdown.find(x => x._id === true)?.count || 0,
          inactive: subscriptionBreakdown.find(x => x._id === false)?.count || 0
        }
      }
    });
  } catch (error) {
    console.error('API Error fetching schools summary:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch schools summary' },
      { status: 500 }
    );
  }
}
