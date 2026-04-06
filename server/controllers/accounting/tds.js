import { getDB } from '../../config/db.js';
import { ObjectId } from 'mongodb';

// Helper to get schoolId for user
export const getSchoolId = async (db, user) => {
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

// TDS Entry Controllers
export const getTDSEntries = async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({ success: false, error: 'Unauthorized - School ID not found' });
    }
    
    console.log('Fetching TDS entries for schoolId:', schoolId);
    
    const entries = await db.collection('tds_entries').find({ schoolId }).sort({ date: -1 }).toArray();
    
    res.status(200).json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Get TDS entries error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const saveTDSEntry = async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({ success: false, error: 'Unauthorized - School ID not found' });
    }
    
    const { payeeId, ruleId, gross, tds, net, date, narration } = req.body;
    
    console.log('Saving TDS entry for schoolId:', schoolId);
    console.log('Data:', { payeeId, ruleId, gross, tds, net, date, narration });
    
    // Validate required fields
    if (!payeeId || !ruleId || !gross || !tds || !net || !date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: payeeId, ruleId, gross, tds, net, date' 
      });
    }
    
    // Validate amounts
    if (typeof gross !== 'number' || gross <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Gross amount must be a positive number' 
      });
    }
    
    if (typeof tds !== 'number' || tds < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'TDS amount must be a non-negative number' 
      });
    }
    
    if (typeof net !== 'number' || net < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Net amount must be a non-negative number' 
      });
    }
    
    // Validate payee exists
    const payee = await db.collection('payees').findOne({ _id: new ObjectId(payeeId), schoolId });
    if (!payee) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payee not found' 
      });
    }
    
    // Validate tax rule exists
    const taxRule = await db.collection('tax_settings').findOne(
      { schoolId, 'taxRules.id': ruleId },
      { projection: { 'taxRules.$': 1 } }
    );
    
    if (!taxRule || !taxRule.taxRules || taxRule.taxRules.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tax rule not found' 
      });
    }
    
    // Create TDS entry
    const entry = {
      schoolId,
      payeeId: new ObjectId(payeeId),
      ruleId,
      gross,
      tds,
      net,
      date,
      narration: narration || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('tds_entries').insertOne(entry);
    
    // Create index for performance
    await db.collection('tds_entries').createIndex({ schoolId: 1 });
    await db.collection('tds_entries').createIndex({ payeeId: 1 });
    await db.collection('tds_entries').createIndex({ date: -1 });
    
    console.log('TDS entry saved:', result.insertedId);
    
    res.status(201).json({
      success: true,
      data: { ...entry, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Save TDS entry error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Payee Controllers
export const getPayees = async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({ success: false, error: 'Unauthorized - School ID not found' });
    }
    
    console.log('Fetching payees for schoolId:', schoolId);
    
    const payees = await db.collection('payees').find({ schoolId }).sort({ name: 1 }).toArray();
    
    res.status(200).json({
      success: true,
      data: payees
    });
  } catch (error) {
    console.error('Get payees error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const savePayee = async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({ success: false, error: 'Unauthorized - School ID not found' });
    }
    
    const { name, pan, type, phone, email, category, threshold } = req.body;
    
    console.log('Saving payee for schoolId:', schoolId);
    console.log('Data:', { name, pan, type, phone, email, category, threshold });
    
    // Validate required fields
    if (!name || !pan || !type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, pan, type' 
      });
    }
    
    // Validate PAN format (9 digits)
    if (!/^\d{9}$/.test(pan)) {
      return res.status(400).json({ 
        success: false, 
        error: 'PAN must be exactly 9 digits' 
      });
    }
    
    // Validate type
    if (!['Employee', 'Vendor'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Type must be either Employee or Vendor' 
      });
    }
    
    // Check for duplicate PAN within the same school
    const existingPayee = await db.collection('payees').findOne({ pan, schoolId });
    if (existingPayee) {
      return res.status(400).json({ 
        success: false, 
        error: 'PAN already exists for another payee' 
      });
    }
    
    // Create payee
    const payee = {
      schoolId,
      name: name.trim(),
      pan,
      type,
      phone: phone || '',
      email: email || '',
      category: category || '',
      threshold: threshold || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('payees').insertOne(payee);
    
    // Create index for performance
    await db.collection('payees').createIndex({ schoolId: 1 });
    await db.collection('payees').createIndex({ pan: 1 });
    
    console.log('Payee saved:', result.insertedId);
    
    res.status(201).json({
      success: true,
      data: { ...payee, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Save payee error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Challan Controllers
export const getChallans = async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({ success: false, error: 'Unauthorized - School ID not found' });
    }
    
    console.log('Fetching challans for schoolId:', schoolId);
    
    const challans = await db.collection('tds_challans').find({ schoolId }).sort({ createdAt: -1 }).toArray();
    
    res.status(200).json({
      success: true,
      data: challans
    });
  } catch (error) {
    console.error('Get challans error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const saveChallan = async (req, res) => {
  try {
    const db = getDB();
    const schoolId = await getSchoolId(db, req.user);
    
    if (!schoolId) {
      return res.status(401).json({ success: false, error: 'Unauthorized - School ID not found' });
    }
    
    const { challanNo, bank, bsr, amount, period, depositDate, revenueCode, entryIds } = req.body;
    
    console.log('Saving challan for schoolId:', schoolId);
    console.log('Data:', { challanNo, bank, bsr, amount, period, depositDate, revenueCode, entryIds });
    
    // Validate required fields
    if (!challanNo || !bank || !amount || !period || !depositDate || !revenueCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: challanNo, bank, amount, period, depositDate, revenueCode' 
      });
    }
    
    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount must be a positive number' 
      });
    }
    
    // Check for duplicate challan number within the same school
    const existingChallan = await db.collection('tds_challans').findOne({ challanNo, schoolId });
    if (existingChallan) {
      return res.status(400).json({ 
        success: false, 
        error: 'Challan number already exists' 
      });
    }
    
    // Validate entry IDs if provided
    let linkedEntries = [];
    if (entryIds && entryIds.length > 0) {
      linkedEntries = entryIds.map(id => new ObjectId(id));
      
      // Verify all entries belong to the same school and are pending
      const entries = await db.collection('tds_entries').find({
        _id: { $in: linkedEntries },
        schoolId,
        status: 'pending'
      }).toArray();
      
      if (entries.length !== linkedEntries.length) {
        return res.status(400).json({
          success: false,
          error: 'Some entries are invalid or not pending'
        });
      }
      
      // Calculate total TDS from linked entries
      const totalTDSEntries = entries.reduce((sum, entry) => sum + entry.tds, 0);
      
      // Validate that challan amount matches total TDS from entries
      if (Math.abs(totalTDSEntries - amount) > 0.01) {
        return res.status(400).json({
          success: false,
          error: `Challan amount (${amount}) must match total TDS from linked entries (${totalTDSEntries})`
        });
      }
    }
    
    // Create challan
    const challan = {
      schoolId,
      challanNo: challanNo.trim(),
      bank: bank.trim(),
      bsr: bsr.trim(),
      amount,
      period: period.trim(),
      depositDate,
      revenueCode: revenueCode.trim(),
      status: 'pending',
      linkedEntries,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('tds_challans').insertOne(challan);
    
    // Update linked entries status to 'deposited' and link to challan
    if (linkedEntries.length > 0) {
      await db.collection('tds_entries').updateMany(
        { _id: { $in: linkedEntries } },
        { 
          $set: { 
            status: 'deposited',
            challanId: result.insertedId,
            updatedAt: new Date()
          }
        }
      );
    }
    
    // Create index for performance
    await db.collection('tds_challans').createIndex({ schoolId: 1 });
    await db.collection('tds_challans').createIndex({ challanNo: 1 });
    await db.collection('tds_challans').createIndex({ linkedEntries: 1 });
    
    console.log('Challan saved:', result.insertedId);
    
    res.status(201).json({
      success: true,
      data: { ...challan, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Save challan error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
