import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { verifyToken, requireAccounting } from '../../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware
router.use(verifyToken);
router.use(requireAccounting);

// Helper to get schoolId for user
const getSchoolId = async (db, user) => {
  if (user.role === 'schooladmin' || user.role === 'superadmin') {
    const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
    return adminData?.schoolId;
  } else if (user.role === 'accountant') {
    const accountantData = await db.collection('accountants').findOne({ _id: new ObjectId(user.id) });
    return accountantData?.schoolId;
  } else if (user.role === 'academic') {
    const academicData = await db.collection('academics').findOne({ _id: new ObjectId(user.id) });
    return academicData?.schoolId;
  }
  return null;
};

// MongoDB connection singleton
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  await client.connect();
  
  const db = client.db('SchoolHub');
  
  // Create index for ledger search performance
  await db.collection('ledgers').createIndex({ schoolId: 1, name: 'text' });
  await db.collection('ledgers').createIndex({ schoolId: 1, type: 1 });
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

// GET /api/accounting/ledgers/search - Backend-driven ledger search
router.get('/search', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    // Get schoolId from authenticated user
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - School ID not found'
      });
    }
    
    const { q, type, isDebit } = req.query;
    
    console.log('Ledger search:', { q, type, isDebit, schoolId });
    
    // Build query
    const query = { schoolId: schoolId };
    
    // Text search if query provided
    if (q && q.trim()) {
      query.name = { $regex: q.trim(), $options: 'i' };
    }
    
    // Filter by voucher type rules if specified
    if (type) {
      const voucherType = type;
      const isDebitBool = isDebit === 'true';
      
      // Apply voucher type filter rules
      switch (voucherType) {
        case 'CN':
          // Contra: Only Cash/Bank
          query.type = { $in: ['Cash', 'Bank'] };
          break;
        case 'RCT':
          // Receipt: Debit -> Cash/Bank, Credit -> Income/Asset
          if (isDebitBool) {
            query.type = { $in: ['Cash', 'Bank'] };
          } else {
            query.type = { $in: ['Income', 'Asset'] };
          }
          break;
        case 'PR':
        case 'PV':
          // Payment/Purchase: Debit -> Expense, Credit -> Cash/Bank
          if (isDebitBool) {
            query.type = { $in: ['Expense'] };
          } else {
            query.type = { $in: ['Cash', 'Bank'] };
          }
          break;
        case 'JV':
        default:
          // Journal: No type restrictions
          break;
      }
    }
    
    // Search ledgers
    const ledgers = await db.collection('ledgers')
      .find(query)
      .sort({ name: 1 })
      .limit(50)
      .toArray();
    
    console.log(`Found ${ledgers.length} ledgers for school ${schoolId}`);
    
    // Format response
    const formattedLedgers = ledgers.map(ledger => ({
      id: ledger._id.toString(),
      name: ledger.name,
      type: ledger.type,
      group: ledger.group,
      code: ledger.code
    }));
    
    res.json({
      success: true,
      data: formattedLedgers,
      count: formattedLedgers.length
    });
    
  } catch (error) {
    console.error('Ledger search error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/accounting/ledgers - Get all ledgers for school
router.get('/', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - School ID not found'
      });
    }
    
    const ledgers = await db.collection('ledgers')
      .find({ schoolId: schoolId })
      .sort({ name: 1 })
      .toArray();
    
    const formattedLedgers = ledgers.map(ledger => ({
      id: ledger._id.toString(),
      name: ledger.name,
      type: ledger.type,
      group: ledger.group,
      code: ledger.code
    }));
    
    res.json({
      success: true,
      data: formattedLedgers
    });
    
  } catch (error) {
    console.error('Get ledgers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/accounting/ledgers - Create new ledger
router.post('/', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - School ID not found'
      });
    }
    
    const { name, type, group, code } = req.body;
    
    if (!name || !type || !group) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, group'
      });
    }
    
    const ledger = {
      schoolId: schoolId,
      name: name.trim(),
      type: type,
      group: group,
      code: code || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('ledgers').insertOne(ledger);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId.toString(),
        ...ledger
      }
    });
    
  } catch (error) {
    console.error('Create ledger error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/accounting/ledgers/:id - Delete ledger
router.delete('/:id', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - School ID not found'
      });
    }
    
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ledger ID'
      });
    }
    
    const result = await db.collection('ledgers').deleteOne({
      _id: new ObjectId(id),
      schoolId: schoolId
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ledger not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Ledger deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete ledger error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/accounting/ledgers/fiscal-year/current - Get current fiscal year
router.get('/fiscal-year/current', async (req, res) => {
  try {
    // Import the date converter
    const { getCurrentBSDate } = await import('../../utils/dateConverter.cjs');
    const currentDate = getCurrentBSDate();
    
    // Determine fiscal year based on current month
    // BS fiscal year: Shrawan (month 4) to Ashad (month 3) of next year
    let fiscalYearStart, fiscalYearEnd;
    
    if (currentDate.month >= 4) {
      // We're in the first half of fiscal year (Shrawan to Chaitra)
      fiscalYearStart = currentDate.year;
      fiscalYearEnd = currentDate.year + 1;
    } else {
      // We're in the second half of fiscal year (Baishakh to Ashad)
      fiscalYearStart = currentDate.year - 1;
      fiscalYearEnd = currentDate.year;
    }
    
    const fiscalYear = `${fiscalYearStart}-${fiscalYearEnd}`;
    
    res.json({
      success: true,
      data: {
        year: currentDate.year,
        month: currentDate.month,
        day: currentDate.day,
        fiscalYear: fiscalYear,
        fiscalYearStart: fiscalYearStart,
        fiscalYearEnd: fiscalYearEnd,
        formatted: `${fiscalYearStart} - ${fiscalYearEnd}`
      }
    });
    
  } catch (error) {
    console.error('Get current fiscal year error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
