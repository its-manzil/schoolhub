import { getDB } from '../../config/db.js';

// Voucher number generator
export const generateVoucherNumber = async (type) => {
  const db = getDB();
  const fiscalYear = '2082'; // This should come from system settings
  
  // Get the last sequence for this type and fiscal year
  const collection = db.collection('voucherSequences');
  const sequence = await collection.findOneAndUpdate(
    { type, fiscalYear },
    { $inc: { sequence: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  
  const sequenceNumber = sequence.sequence.toString().padStart(4, '0');
  return `${type}-${fiscalYear}-${sequenceNumber}`;
};

// Create voucher with entries
export const createVoucher = async (voucherData) => {
  const db = getDB();
  const session = await db.startSession();
  
  try {
    let voucherId;
    await session.withTransaction(async () => {
      // Insert voucher
      const voucherCollection = db.collection('vouchers');
      const voucherResult = await voucherCollection.insertOne({
        ...voucherData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      voucherId = voucherResult.insertedId;
      
      // Insert voucher entries with voucherId reference
      const entriesCollection = db.collection('voucherEntries');
      const entriesWithRef = voucherData.entries.map(entry => ({
        ...entry,
        voucherId,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      await entriesCollection.insertMany(entriesWithRef);
    });
    
    return {
      ...voucherData,
      _id: voucherId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } finally {
    await session.endSession();
  }
};

// Update voucher and entries
export const updateVoucher = async (id, updateData) => {
  const db = getDB();
  const session = await db.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Update voucher
      const voucherCollection = db.collection('vouchers');
      await voucherCollection.updateOne(
        { _id: id },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );
      
      // Update entries if provided
      if (updateData.entries) {
        const entriesCollection = db.collection('voucherEntries');
        
        // Delete existing entries for this voucher
        await entriesCollection.deleteMany({ voucherId: id });
        
        // Insert new entries
        const entriesWithRef = updateData.entries.map(entry => ({
          ...entry,
          voucherId: id,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        
        await entriesCollection.insertMany(entriesWithRef);
      }
    });
    
    return await getVoucherById(id);
  } finally {
    await session.endSession();
  }
};

// Post voucher (change status to posted)
export const postVoucher = async (id) => {
  const db = getDB();
  const session = await db.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Update voucher status to posted
      const voucherCollection = db.collection('vouchers');
      await voucherCollection.updateOne(
        { _id: id },
        { 
          $set: {
            status: 'posted',
            updatedAt: new Date()
          }
        }
      );
    });
    
    return await getVoucherById(id);
  } finally {
    await session.endSession();
  }
};

// Get voucher by ID with entries
export const getVoucherById = async (id) => {
  const db = getDB();
  
  // Get voucher
  const voucherCollection = db.collection('vouchers');
  const voucher = await voucherCollection.findOne({ _id: id });
  
  if (!voucher) {
    return null;
  }
  
  // Get entries for this voucher
  const entriesCollection = db.collection('voucherEntries');
  const entries = await entriesCollection.find({ voucherId: id }).toArray();
  
  return {
    ...voucher,
    entries
  };
};

// List vouchers with pagination and filtering
export const listVouchers = async (options) => {
  const db = getDB();
  const {
    page = 1,
    limit = 10,
    filters = {}
  } = options;
  
  const voucherCollection = db.collection('vouchers');
  
  // Build query
  const query = {};
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  if (filters.fiscalYear) query.fiscalYear = filters.fiscalYear;
  if (filters.dateFrom || filters.dateTo) {
    query.date = {};
    if (filters.dateFrom) query.date.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.date.$lte = new Date(filters.dateTo);
  }
  
  // Get total count for pagination
  const total = await voucherCollection.countDocuments(query);
  
  // Get vouchers with pagination
  const skip = (page - 1) * limit;
  const vouchers = await voucherCollection
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  
  return {
    vouchers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};
