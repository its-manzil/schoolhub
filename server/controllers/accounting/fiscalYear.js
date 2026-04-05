import { getDB } from '../../config/db.js';
import { ObjectId } from 'mongodb';
import { toBS, formatBSDate, convertDatesInObject, toAD } from '../../utils/dateConverter.cjs';

export const getFiscalYears = async (req, res) => {
  try {
    const db = getDB();
    const fiscalYears = await db.collection('fiscalyears').find({}).toArray();
    
    // Convert AD dates to BS for frontend
    const fiscalYearsWithBS = fiscalYears.map(fy => {
      const converted = convertDatesInObject(fy);
      return {
        ...converted,
        startDateBS: fy.startDate ? formatBSDate(toBS(fy.startDate)) : null,
        endDateBS: fy.endDate ? formatBSDate(toBS(fy.endDate)) : null
      };
    });
    
    res.status(200).json(fiscalYearsWithBS);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFiscalYear = async (req, res) => {
  try {
    const db = getDB();
    
    // Convert BS dates to AD for storage
    const { startDate, endDate, ...otherData } = req.body;
    
    const newFiscalYear = {
      ...otherData,
      startDate: startDate ? toAD(startDate) : null,
      endDate: endDate ? toAD(endDate) : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('fiscalyears').insertOne(newFiscalYear);
    
    // Convert back to BS for response
    const response = {
      _id: result.insertedId,
      ...newFiscalYear,
      startDateBS: newFiscalYear.startDate ? formatBSDate(toBS(newFiscalYear.startDate)) : null,
      endDateBS: newFiscalYear.endDate ? formatBSDate(toBS(newFiscalYear.endDate)) : null
    };
    
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFiscalYear = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    // Remove _id from the update data to avoid modifying immutable field
    const { _id: _, startDateBS, endDateBS, ...updateData } = req.body;
    
    // Convert BS dates to AD if they exist
    if (startDateBS) {
      updateData.startDate = toAD(startDateBS);
    }
    if (endDateBS) {
      updateData.endDate = toAD(endDateBS);
    }
    
    const result = await db.collection('fiscalyears').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Fiscal year not found' });
    }
    
    // Get the updated fiscal year to return
    const updatedFiscalYear = await db.collection('fiscalyears').findOne({ _id: new ObjectId(id) });
    
    if (!updatedFiscalYear) {
      return res.status(404).json({ message: 'Fiscal year not found after update' });
    }
    
    // Convert dates to BS for response
    const converted = convertDatesInObject(updatedFiscalYear);
    const response = {
      ...converted,
      startDateBS: updatedFiscalYear.startDate ? formatBSDate(toBS(updatedFiscalYear.startDate)) : null,
      endDateBS: updatedFiscalYear.endDate ? formatBSDate(toBS(updatedFiscalYear.endDate)) : null
    };
    
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFiscalYear = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    const result = await db.collection('fiscalyears').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Fiscal year not found' });
    }
    
    res.status(200).json({ message: 'Fiscal year deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const activateFiscalYear = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    // Deactivate all fiscal years first
    await db.collection('fiscalyears').updateMany({}, { $set: { isActive: false } });
    
    // Activate the selected fiscal year
    const result = await db.collection('fiscalyears').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: true, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Fiscal year not found' });
    }
    
    // Get the updated fiscal year to return
    const updatedFiscalYear = await db.collection('fiscalyears').findOne({ _id: new ObjectId(id) });
    
    if (!updatedFiscalYear) {
      return res.status(404).json({ message: 'Fiscal year not found after update' });
    }
    
    // Convert dates to BS for response
    const converted = convertDatesInObject(updatedFiscalYear);
    const response = {
      ...converted,
      startDateBS: updatedFiscalYear.startDate ? formatBSDate(toBS(updatedFiscalYear.startDate)) : null,
      endDateBS: updatedFiscalYear.endDate ? formatBSDate(toBS(updatedFiscalYear.endDate)) : null
    };
    
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
