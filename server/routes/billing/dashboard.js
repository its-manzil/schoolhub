import express from 'express';
import { getDB } from '../../config/db.js';
import { getCurrentBSDate, toBS, formatBSDate } from '../../utils/dateConverter.cjs';

const router = express.Router();

// Helper to get schoolId from headers
const getSchoolId = (req) => {
  const id = req.headers['x-school-id'] || req.body.schoolId || req.query.schoolId || null;
  if (id && !isNaN(id)) {
    return Number(id);
  }
  return id;
};

/**
 * GET /api/billing/dashboard/summary
 * Get dashboard summary with real-time billing metrics
 */
router.get('/summary', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const db = getDB();

    // Get current BS date for academic year filtering
    const bsDate = getCurrentBSDate();
    const currentYear = bsDate.year;
    const academicYear = `${currentYear}-${currentYear + 1}`;

    // Get today's date in BS format
    const todayBS = formatBSDate(bsDate);
    const today = new Date();
    
    // Set start of today and end of today
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Set start of month
    const startOfMonth = new Date(today);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // --- ACADEMIC BILLS AGGREGATION ---
    
    // Today's collection from academic bills (paid status)
    const todayAcademicCollection = await db.collection('bills').aggregate([
      {
        $match: {
          schoolId,
          createdAt: { $gte: startOfToday, $lte: endOfToday },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]).toArray();

    // Monthly collection from academic bills
    const monthlyAcademicCollection = await db.collection('bills').aggregate([
      {
        $match: {
          schoolId,
          createdAt: { $gte: startOfMonth },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]).toArray();

    // Pending dues from academic bills
    const academicPendingDues = await db.collection('bills').aggregate([
      {
        $match: {
          schoolId,
          paymentStatus: { $in: ['pending', 'partial'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]).toArray();

    // --- INVENTORY BILLS AGGREGATION ---
    
    // Today's collection from inventory bills
    const todayInventoryCollection = await db.collection('inventory_bills').aggregate([
      {
        $match: {
          schoolId,
          createdAt: { $gte: startOfToday.toISOString(), $lte: endOfToday.toISOString() },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]).toArray();

    // Monthly collection from inventory bills
    const monthlyInventoryCollection = await db.collection('inventory_bills').aggregate([
      {
        $match: {
          schoolId,
          createdAt: { $gte: startOfMonth.toISOString() },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]).toArray();

    // Pending dues from inventory bills
    const inventoryPendingDues = await db.collection('inventory_bills').aggregate([
      {
        $match: {
          schoolId,
          paymentStatus: { $in: ['pending'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]).toArray();

    // --- STUDENT STATUS METRICS ---
    
    // Count students with fully paid status (academic bills only for now)
    const paidStudents = await db.collection('bills').aggregate([
      { $match: { schoolId, paymentStatus: 'paid' } },
      { $group: { _id: '$studentId' } },
      { $count: 'total' }
    ]).toArray();

    // Count students with partial payment
    const partialStudents = await db.collection('bills').aggregate([
      { $match: { schoolId, paymentStatus: 'partial' } },
      { $group: { _id: '$studentId' } },
      { $count: 'total' }
    ]).toArray();

    // Count students with pending payments
    const pendingStudents = await db.collection('bills').aggregate([
      { $match: { schoolId, paymentStatus: 'pending' } },
      { $group: { _id: '$studentId' } },
      { $count: 'total' }
    ]).toArray();

    // --- OVERDUE BILLS ---
    // Bills that are pending and older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const overdueAcademicBills = await db.collection('bills').countDocuments({
      schoolId,
      paymentStatus: { $in: ['pending', 'partial'] },
      createdAt: { $lt: thirtyDaysAgo }
    });

    const overdueInventoryBills = await db.collection('inventory_bills').countDocuments({
      schoolId,
      paymentStatus: 'pending',
      createdAt: { $lt: thirtyDaysAgo.toISOString() }
    });

    // --- PENDING INVOICES COUNT ---
    const pendingAcademicInvoices = await db.collection('bills').countDocuments({
      schoolId,
      paymentStatus: { $in: ['pending', 'partial'] }
    });

    const pendingInventoryInvoices = await db.collection('inventory_bills').countDocuments({
      schoolId,
      paymentStatus: 'pending'
    });

    // Calculate totals
    const todayCollection = (todayAcademicCollection[0]?.total || 0) + (todayInventoryCollection[0]?.total || 0);
    const monthlyCollection = (monthlyAcademicCollection[0]?.total || 0) + (monthlyInventoryCollection[0]?.total || 0);
    const pendingDues = (academicPendingDues[0]?.total || 0) + (inventoryPendingDues[0]?.total || 0);
    const overdueBills = overdueAcademicBills + overdueInventoryBills;
    const pendingInvoices = pendingAcademicInvoices + pendingInventoryInvoices;

    res.json({
      success: true,
      data: {
        todayCollection,
        monthlyCollection,
        pendingDues,
        overdueBills,
        pendingInvoices,
        academicYear,
        studentStatus: {
          paid: paidStudents[0]?.total || 0,
          partial: partialStudents[0]?.total || 0,
          pending: pendingStudents[0]?.total || 0
        },
        bsDate: {
          year: currentYear,
          month: bsDate.month,
          day: bsDate.day,
          formatted: todayBS
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard summary' });
  }
});

/**
 * GET /api/billing/dashboard/activity
 * Get last 10 bills for activity feed (unified academic + inventory)
 */
router.get('/activity', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const db = getDB();

    // Fetch last 5 academic bills
    const academicBills = await db.collection('bills')
      .find({ schoolId })
      .sort({ createdAt: -1 })
      .limit(5)
      .project({
        invoiceId: 1,
        studentId: 1,
        studentName: 1,
        totalAmount: 1,
        paymentMode: 1,
        paymentStatus: 1,
        createdAt: 1,
        createdAtBS: 1
      })
      .toArray();

    // Fetch last 5 inventory bills
    const inventoryBills = await db.collection('inventory_bills')
      .find({ schoolId })
      .sort({ createdAt: -1 })
      .limit(5)
      .project({
        invoiceId: 1,
        studentId: 1,
        studentName: 1,
        totalAmount: 1,
        paymentMode: 1,
        paymentStatus: 1,
        createdAt: 1
      })
      .toArray();

    // Normalize and combine
    const normalizedAcademic = academicBills.map(bill => ({
      type: 'academic',
      invoiceId: bill.invoiceId,
      studentId: bill.studentId,
      studentName: bill.studentName,
      amount: bill.totalAmount,
      paymentStatus: bill.paymentStatus,
      createdAt: bill.createdAt,
      createdAtBS: bill.createdAtBS
    }));

    const normalizedInventory = inventoryBills.map(bill => {
      let createdAtBS = '';
      if (bill.createdAt) {
        try {
          const date = new Date(bill.createdAt);
          const bsDate = toBS(date);
          createdAtBS = formatBSDate(bsDate);
        } catch {
          createdAtBS = '';
        }
      }
      return {
        type: 'inventory',
        invoiceId: bill.invoiceId,
        studentId: bill.studentId,
        studentName: bill.studentName,
        amount: bill.totalAmount,
        paymentStatus: bill.paymentStatus,
        createdAt: bill.createdAt,
        createdAtBS
      };
    });

    // Combine and sort
    const allActivity = [...normalizedAcademic, ...normalizedInventory]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({
      success: true,
      data: allActivity
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch activity' });
  }
});

/**
 * GET /api/billing/dashboard/recent-bills
 * Get last 10 bills for activity feed
 */
router.get('/recent-bills', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const db = getDB();

    // Fetch last 5 academic bills
    const academicBills = await db.collection('bills')
      .find({ schoolId })
      .sort({ createdAt: -1 })
      .limit(5)
      .project({
        invoiceId: 1,
        studentName: 1,
        totalAmount: 1,
        paymentMode: 1,
        paymentStatus: 1,
        createdAt: 1,
        createdAtBS: 1,
        billType: 1
      })
      .toArray();

    // Fetch last 5 inventory bills
    const inventoryBills = await db.collection('inventory_bills')
      .find({ schoolId })
      .sort({ createdAt: -1 })
      .limit(5)
      .project({
        invoiceId: 1,
        studentName: 1,
        totalAmount: 1,
        paymentMode: 1,
        paymentStatus: 1,
        createdAt: 1,
        billType: 1
      })
      .toArray();

    // Combine and format
    const allBills = [
      ...academicBills.map(bill => ({
        ...bill,
        type: 'academic'
      })),
      ...inventoryBills.map(bill => {
        let createdAtBS = '';
        if (bill.createdAt) {
          try {
            const date = new Date(bill.createdAt);
            const bsDate = toBS(date);
            createdAtBS = formatBSDate(bsDate);
          } catch {
            createdAtBS = '';
          }
        }
        return {
          ...bill,
          type: 'inventory',
          createdAtBS
        };
      })
    ];

    // Sort by createdAt descending
    allBills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Take top 10
    const recentBills = allBills.slice(0, 10).map(bill => ({
      invoiceId: bill.invoiceId,
      studentName: bill.studentName,
      amount: bill.totalAmount,
      paymentMode: bill.paymentMode || 'Cash',
      status: bill.paymentStatus,
      type: bill.type,
      createdAt: bill.createdAt,
      createdAtBS: bill.createdAtBS || formatBSDate(getCurrentBSDate()),
      // Activity message
      activityMessage: bill.paymentStatus === 'paid' 
        ? `${bill.studentName} paid Rs ${bill.totalAmount?.toLocaleString('en-IN')} via ${bill.paymentMode || 'Cash'}`
        : `Invoice ${bill.invoiceId} generated - ${bill.paymentStatus === 'pending' ? 'Pending' : 'Partial'}`
    }));

    res.json({
      success: true,
      data: recentBills
    });
  } catch (error) {
    console.error('Error fetching recent bills:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recent bills' });
  }
});

/**
 * GET /api/billing/dashboard/trends
 * Get collection trends for charts
 */
router.get('/trends', async (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    const db = getDB();

    const today = new Date();
    
    // Last 7 days collection
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Academic bills for this day
      const academicDayCollection = await db.collection('bills').aggregate([
        {
          $match: {
            schoolId,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]).toArray();

      // Inventory bills for this day
      const inventoryDayCollection = await db.collection('inventory_bills').aggregate([
        {
          $match: {
            schoolId,
            createdAt: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]).toArray();

      const dayTotal = (academicDayCollection[0]?.total || 0) + (inventoryDayCollection[0]?.total || 0);
      
      last7Days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        collection: dayTotal
      });
    }

    // Last 6 months collection
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      // Academic bills for this month
      const academicMonthCollection = await db.collection('bills').aggregate([
        {
          $match: {
            schoolId,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]).toArray();

      // Inventory bills for this month
      const inventoryMonthCollection = await db.collection('inventory_bills').aggregate([
        {
          $match: {
            schoolId,
            createdAt: { $gte: startOfMonth.toISOString(), $lte: endOfMonth.toISOString() },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]).toArray();

      const monthTotal = (academicMonthCollection[0]?.total || 0) + (inventoryMonthCollection[0]?.total || 0);

      last6Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        year,
        collection: monthTotal
      });
    }

    // --- PIE CHART DATA: Paid vs Pending Ratio ---
    // Academic bills payment status
    const academicPaidCount = await db.collection('bills').countDocuments({
      schoolId,
      paymentStatus: 'paid'
    });
    const academicPendingCount = await db.collection('bills').countDocuments({
      schoolId,
      paymentStatus: { $in: ['pending', 'partial'] }
    });

    // Inventory bills payment status
    const inventoryPaidCount = await db.collection('inventory_bills').countDocuments({
      schoolId,
      paymentStatus: 'paid'
    });
    const inventoryPendingCount = await db.collection('inventory_bills').countDocuments({
      schoolId,
      paymentStatus: 'pending'
    });

    const totalPaid = academicPaidCount + inventoryPaidCount;
    const totalPending = academicPendingCount + inventoryPendingCount;

    const paymentStatusDistribution = [
      { name: 'Paid', value: totalPaid, color: '#10b981' },
      { name: 'Pending', value: totalPending, color: '#f59e0b' }
    ];

    // Bill type distribution (Academic vs Inventory)
    const academicTotal = await db.collection('bills').countDocuments({ schoolId });
    const inventoryTotal = await db.collection('inventory_bills').countDocuments({ schoolId });

    const billTypeDistribution = [
      { name: 'Academic', value: academicTotal, color: '#3b82f6' },
      { name: 'Inventory', value: inventoryTotal, color: '#8b5cf6' }
    ];

    res.json({
      success: true,
      data: {
        dailyTrends: last7Days,
        monthlyTrends: last6Months,
        paymentStatusDistribution,
        billTypeDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trends' });
  }
});

export default router;
