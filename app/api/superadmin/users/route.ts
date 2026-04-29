import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET - Fetch users summary for dashboard
export async function GET() {
  try {
    console.log('API: Fetching users summary...');
    const { db } = await connectToDatabase();
    
    // Get counts from all user collections
    const [
      superadmins,
      schooladmins,
      teachers,
      students,
      parents,
      accountants,
      staff
    ] = await Promise.all([
      db.collection('superadmins').countDocuments(),
      db.collection('schooladmins').countDocuments(),
      db.collection('teachers').countDocuments(),
      db.collection('students').countDocuments(),
      db.collection('parents').countDocuments(),
      db.collection('accountants').countDocuments(),
      db.collection('staff').countDocuments()
    ]);
    
    const totalUsers = superadmins + schooladmins + teachers + students + parents + accountants + staff;
    
    // Get users created in last 30 days (from all collections)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [
      recentSuperadmins,
      recentSchooladmins,
      recentTeachers,
      recentStudents,
      recentParents
    ] = await Promise.all([
      db.collection('superadmins').countDocuments({ createdAt: { $gte: thirtyDaysAgo.toISOString() } }),
      db.collection('schooladmins').countDocuments({ createdAt: { $gte: thirtyDaysAgo.toISOString() } }),
      db.collection('teachers').countDocuments({ createdAt: { $gte: thirtyDaysAgo.toISOString() } }),
      db.collection('students').countDocuments({ createdAt: { $gte: thirtyDaysAgo.toISOString() } }),
      db.collection('parents').countDocuments({ createdAt: { $gte: thirtyDaysAgo.toISOString() } })
    ]);
    
    const recentUsers = recentSuperadmins + recentSchooladmins + recentTeachers + recentStudents + recentParents;
    
    console.log('API: Users summary fetched', {
      total: totalUsers,
      recent: recentUsers
    });
    
    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        recentUsers,
        breakdown: {
          superadmins,
          schooladmins,
          teachers,
          students,
          parents,
          accountants,
          staff
        },
        byRole: [
          { role: 'Super Admins', count: superadmins, color: '#6366f1' },
          { role: 'School Admins', count: schooladmins, color: '#8b5cf6' },
          { role: 'Teachers', count: teachers, color: '#10b981' },
          { role: 'Students', count: students, color: '#3b82f6' },
          { role: 'Parents', count: parents, color: '#f59e0b' },
          { role: 'Accountants', count: accountants, color: '#ef4444' },
          { role: 'Staff', count: staff, color: '#6b7280' }
        ].filter(item => item.count > 0)
      }
    });
  } catch (error) {
    console.error('API Error fetching users summary:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users summary' },
      { status: 500 }
    );
  }
}
