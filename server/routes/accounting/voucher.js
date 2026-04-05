import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { verifyToken, requireAccounting } from '../../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all voucher routes
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

// Test endpoint
router.get('/test', (req, res) => {
  console.log('GET /api/accounting/voucher/test - Test endpoint called');
  res.json({
    success: true,
    message: 'Voucher API is working',
    timestamp: new Date().toISOString()
  });
});

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
  
  // Create index for performance on schoolId queries
  await db.collection('vouchers').createIndex({ schoolId: 1 });
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}

// POST /api/accounting/voucher - Create new voucher
router.post('/', async (req, res) => {
  console.log('POST /api/accounting/voucher - Request received');
  
  try {
    // Ensure we always return JSON, even for errors
    res.setHeader('Content-Type', 'application/json');
    
    const { db } = await connectToDatabase();
    
    // Get schoolId from authenticated user
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      console.log('Unauthorized: No schoolId found for user');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - School ID not found'
      });
    }
    
    const body = req.body;
    console.log('Request body:', body);
    console.log('User schoolId:', schoolId);
    
    // Validate body exists
    if (!body) {
      console.log('No body provided');
      return res.status(400).json({
        success: false,
        error: 'No data provided'
      });
    }
    
    // Validate required fields
    if (!body.type || !body.date || !body.entries || !Array.isArray(body.entries)) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, date, entries'
      });
    }
    
    // Validate entries
    if (body.entries.length === 0) {
      console.log('Validation failed: no entries');
      return res.status(400).json({
        success: false,
        error: 'At least one entry is required'
      });
    }
    
    // Check if entries have valid ledger data
    for (const entry of body.entries) {
      if (!entry.ledgerName || (!entry.debit && !entry.credit)) {
        console.log('Validation failed: invalid entry', entry);
        return res.status(400).json({
          success: false,
          error: 'Each entry must have ledgerName and either debit or credit amount'
        });
      }
    }
    
    console.log('Validation passed, connecting to database...');
    
    console.log('Database connected, creating voucher...');
    
    // Prepare voucher document with schoolId
    const voucher = {
      schoolId: schoolId, // REQUIRED FOR MULTI-TENANCY
      type: body.type,
      date: body.date,
      fiscalYear: body.fiscalYear || '2082/83',
      refNo: body.refNo || '',
      narration: body.narration || '',
      entries: body.entries.map(entry => ({
        ledgerId: entry.ledgerId || new ObjectId().toString(),
        ledgerName: entry.ledgerName,
        debit: Number(entry.debit) || 0,
        credit: Number(entry.credit) || 0,
        description: entry.description || ''
      })),
      status: 'Draft',
      voucherNo: body.voucherNo || generateVoucherNumber(body.type),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Creating voucher with schoolId:', schoolId);
    
    // Insert into database
    const result = await db.collection('vouchers').insertOne(voucher);
    console.log('Voucher inserted successfully:', result.insertedId);
    
    // Return success response
    const responseData = {
      success: true,
      data: {
        _id: result.insertedId.toString(),
        ...voucher
      }
    };
    
    console.log('Sending response:', responseData);
    return res.status(201).json(responseData);
    
  } catch (error) {
    console.error('API ERROR:', error);
    
    // Ensure we always return JSON, even in catch blocks
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal Server Error'
      });
    }
  }
});

// POST /api/accounting/voucher/:id/post - Post a voucher
router.post('/:id/post', async (req, res) => {
  console.log('POST /api/accounting/voucher/:id/post - Request received');
  
  try {
    // Ensure we always return JSON, even for errors
    res.setHeader('Content-Type', 'application/json');
    
    const { db } = await connectToDatabase();
    
    // Get schoolId from authenticated user
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      console.log('Unauthorized: No schoolId found for user');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - School ID not found'
      });
    }
    
    const { id } = req.params;
    console.log('Posting voucher with ID:', id);
    console.log('User schoolId:', schoolId);
    
    if (!ObjectId.isValid(id)) {
      console.log('Invalid voucher ID');
      return res.status(400).json({
        success: false,
        error: 'Invalid voucher ID'
      });
    }
    
    // Check if voucher exists and belongs to user's school
    const voucher = await db.collection('vouchers').findOne({ 
      _id: new ObjectId(id),
      schoolId: schoolId // MULTI-TENANT: Only access school's vouchers
    });
    
    if (!voucher) {
      console.log('Voucher not found or access denied');
      return res.status(404).json({
        success: false,
        error: 'Voucher not found'
      });
    }
    
    if (voucher.status !== 'Draft') {
      console.log('Voucher already posted');
      return res.status(400).json({
        success: false,
        error: 'Voucher is already posted'
      });
    }
    
    // Validate voucher is balanced
    const totalDebit = voucher.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
    const totalCredit = voucher.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      console.log('Voucher not balanced:', { totalDebit, totalCredit });
      return res.status(400).json({
        success: false,
        error: 'Voucher is not balanced. Debit and credit must be equal.'
      });
    }
    
    console.log('Updating voucher status to Posted...');
    
    // Update voucher status to Posted
    const result = await db.collection('vouchers').updateOne(
      { 
        _id: new ObjectId(id),
        schoolId: schoolId // MULTI-TENANT: Only update school's vouchers
      },
      { 
        $set: { 
          status: 'Posted',
          postedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      console.log('Failed to update voucher');
      return res.status(500).json({
        success: false,
        error: 'Failed to update voucher'
      });
    }
    
    // Get updated voucher
    const updatedVoucher = await db.collection('vouchers').findOne({ 
      _id: new ObjectId(id),
      schoolId: schoolId // MULTI-TENANT: Only fetch school's vouchers
    });
    
    console.log('Voucher posted successfully');
    
    return res.json({
      success: true,
      data: {
        _id: updatedVoucher._id,
        voucherNo: updatedVoucher.voucherNo,
        status: updatedVoucher.status,
        postedAt: updatedVoucher.postedAt
      }
    });
    
  } catch (error) {
    console.error('API ERROR:', error);
    
    // Ensure we always return JSON, even in catch blocks
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal Server Error'
      });
    }
  }
});

// GET /api/accounting/voucher - List vouchers
router.get('/', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    // Get schoolId from authenticated user
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      console.log('Unauthorized: No schoolId found for user');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - School ID not found'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    const status = req.query.status;
    
    console.log('Fetching vouchers for schoolId:', schoolId);
    
    // Build query with schoolId filter
    const query = { schoolId: schoolId }; // MULTI-TENANT: Only fetch school's vouchers
    if (type) query.type = type;
    if (status) query.status = status;
    
    // Get vouchers with pagination
    const skip = (page - 1) * limit;
    const vouchers = await db.collection('vouchers')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await db.collection('vouchers').countDocuments(query);
    
    console.log(`Found ${total} vouchers for school ${schoolId}`);
    
    res.json({
      success: true,
      data: vouchers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Voucher listing error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/accounting/voucher/:id - Get single voucher
router.get('/:id', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    
    // Get schoolId from authenticated user
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      console.log('Unauthorized: No schoolId found for user');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - School ID not found'
      });
    }
    
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid voucher ID'
      });
    }
    
    console.log('Fetching voucher for schoolId:', schoolId, 'voucherId:', id);
    
    const voucher = await db.collection('vouchers').findOne({ 
      _id: new ObjectId(id),
      schoolId: schoolId // MULTI-TENANT: Only fetch school's vouchers
    });
    
    if (!voucher) {
      console.log('Voucher not found or access denied');
      return res.status(404).json({
        success: false,
        error: 'Voucher not found'
      });
    }
    
    console.log('Voucher found for school:', schoolId);
    
    res.json({
      success: true,
      data: voucher
    });
    
  } catch (error) {
    console.error('Get voucher error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

function generateVoucherNumber(type) {
  const prefixes = {
    'JV': 'JV',
    'RCT': 'RCT', 
    'PR': 'PR',
    'CN': 'CN'
  };
  
  const prefix = prefixes[type] || 'VO';
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${timestamp}`;
}

export default router;
