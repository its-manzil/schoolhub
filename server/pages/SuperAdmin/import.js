import express from 'express';
import multer from 'multer';
import { getDB } from '../../config/db.js';
import { verifyToken, requireSuperAdmin } from '../../middleware/auth.js';
import { parseString } from 'fast-csv';
import { ObjectId } from 'mongodb';
import * as XLSX from 'xlsx';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB limit
  }
});

router.post('/upload', verifyToken, requireSuperAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const mapping = JSON.parse(req.body.mapping || '{}');
    const schoolId = parseInt(req.body.schoolId);
    
    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'School ID required' });
    }

    const db = getDB();
    
    // Create job record
    const jobResult = await db.collection('import_jobs').insertOne({
      schoolId,
      status: 'processing',
      totalRows: 0,
      processedRows: 0,
      errors: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    const jobId = jobResult.insertedId;
    
    // Send immediate response so frontend can start polling
    res.json({ success: true, jobId: jobId.toString(), message: 'Import started' });
    
    // Start background processing
    processImportJob(req.file, mapping, schoolId, jobId, db).catch(async (error) => {
      console.error('Background import failed:', error);
      await db.collection('import_jobs').updateOne(
        { _id: new ObjectId(jobId) },
        { 
          $set: { 
            status: 'failed', 
            error: error.message,
            updatedAt: new Date().toISOString() 
          } 
        }
      );
    });
    
  } catch (error) {
    console.error('Import Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

router.get('/status/:jobId', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { jobId } = req.params;
    const db = getDB();
    
    const job = await db.collection('import_jobs').findOne({ _id: new ObjectId(jobId) });
    
    if (!job) {
       return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Job Status Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Background processing function
async function processImportJob(file, mapping, schoolId, jobId, db) {
  let mappedDocs = [];
  let totalProcessed = 0;
  let errorCount = 0;
  
  const CHUNK_SIZE = 1000;
  
  // Create an inverted mapping: fileHeader -> systemKey
  const activeMapping = Object.entries(mapping).filter(([_, sysKey]) => sysKey !== '');
  
  const insertChunk = async (chunk) => {
    if (chunk.length === 0) return;
    try {
      // Setup base fields for student
      const studentsToInsert = chunk.map(doc => {
        return {
          ...doc,
          schoolId,
          role: 'student',
          isActive: true,
          permissions: [
            'view_assignments',
            'view_grades',
            'view_timetable',
            'view_attendance'
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: null
        };
      });
      
      await db.collection('students').insertMany(studentsToInsert);
      totalProcessed += chunk.length;
      
      // Update progress in DB periodically
      await db.collection('import_jobs').updateOne(
        { _id: new ObjectId(jobId) },
        { $set: { processedRows: totalProcessed, totalRows: totalProcessed, errors: errorCount, updatedAt: new Date().toISOString() } }
      );
    } catch (err) {
      console.error('Chunk insert error:', err);
      errorCount += chunk.length; // Count the whole chunk as failed or retry item by item.
    }
  };

  let csvString = '';

  if (file.originalname.toLowerCase().endsWith('.csv')) {
    csvString = file.buffer.toString('utf-8');
  } else if (file.originalname.toLowerCase().endsWith('.xlsx')) {
     const workbook = XLSX.read(file.buffer, { type: 'buffer' });
     const firstSheetName = workbook.SheetNames[0];
     const sheet = workbook.Sheets[firstSheetName];
     csvString = XLSX.utils.sheet_to_csv(sheet);
  } else {
     throw new Error('Unsupported file type');
  }
    
  return new Promise((resolve, reject) => {
     parseString(csvString, { headers: true, skipLines: 0 })
       .on('data', row => {
          let doc = {};
          let hasRequired = true; // Simplified required check
          
          for (const [fileHeader, sysKey] of activeMapping) {
            if (row[fileHeader] !== undefined) {
               doc[sysKey] = row[fileHeader].trim();
            }
          }
          
          if (doc.name && doc.class) { // Our basic required fields
            doc.className = doc.class;
            delete doc.class;
            
            // Generate a bulk student ID
            doc.studentId = `IMP${schoolId}${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
            
            mappedDocs.push(doc);
          } else {
            errorCount++;
          }
          
          if (mappedDocs.length >= CHUNK_SIZE) {
             const chunk = [...mappedDocs];
             mappedDocs = [];
             insertChunk(chunk); // fire & forget roughly in stream
          }
       })
       .on('end', async rowCount => {
           if (mappedDocs.length > 0) {
              await insertChunk(mappedDocs);
           }
           
           await db.collection('import_jobs').updateOne(
              { _id: new ObjectId(jobId) },
              { $set: { status: 'completed', processedRows: totalProcessed, totalRows: totalProcessed, errors: errorCount, updatedAt: new Date().toISOString() } }
           );
           resolve();
       })
       .on('error', reject);
  });
}

export default router;
