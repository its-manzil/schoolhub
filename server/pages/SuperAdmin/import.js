import express from 'express';
import multer from 'multer';
import { getDB } from '../../config/db.js';
import { verifyToken, requireSuperAdmin } from '../../middleware/auth.js';
import { parseString } from 'fast-csv';
import { ObjectId } from 'mongodb';
import * as XLSX from 'xlsx';
import { hashPassword } from '../../utils/password.js';

const router = express.Router();

// Helper functions for student ID generation (replicated from students.js)
const formatClassCode = (className) => {
  if (!className) return '00';
  const s = className.toString().toUpperCase().trim()
    .replace(/^(CLASS|GRADE)\s+/i, '') // Remove "Class " or "Grade " prefix
    .trim();
  
  switch(s) {
    case 'N':
    case 'NURSERY':
      return '0N';
    case 'LKG':
      return '0L';
    case 'UKG':
      return '0U';
    default:
      const classNum = parseInt(s);
      if (!isNaN(classNum) && classNum >= 1 && classNum <= 12) {
        return classNum.toString().padStart(2, '0');
      }
      return s.padStart(2, '0');
  }
};

const getNextStudentSequence = async (schoolId, currentYear, className, db) => {
  const classCode = formatClassCode(className);
  const idPattern = `${schoolId}${currentYear}${classCode}`;
  
  const existingStudents = await db.collection('students')
    .find({
      studentId: { $regex: `^${idPattern}` },
      schoolId: parseInt(schoolId)
    })
    .sort({ studentId: -1 })
    .toArray();
  
  if (existingStudents.length === 0) {
    return '001';
  }
  
  let maxSequence = 0;
  existingStudents.forEach(student => {
    const sequencePart = student.studentId.slice(idPattern.length);
    const sequenceNum = parseInt(sequencePart);
    if (!isNaN(sequenceNum) && sequenceNum > maxSequence) {
      maxSequence = sequenceNum;
    }
  });
  
  return (maxSequence + 1).toString().padStart(3, '0');
};

const generateStudentId = async (schoolId, className, admissionYear, db) => {
  const currentYear = admissionYear || new Date().getFullYear();
  const classCode = formatClassCode(className);
  const sequence = await getNextStudentSequence(schoolId, currentYear, className, db);
  return `${schoolId}${currentYear}${classCode}${sequence}`;
};

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
  let totalProcessed = 0;
  let errorCount = 0;
  const password = 'Student@123';
  const hashedPassword = await hashPassword(password);
  
  // Create an inverted mapping: fileHeader -> systemKey
  const activeMapping = Object.entries(mapping).filter(([, sysKey]) => sysKey !== '');
  
  const processRow = async (row) => {
    try {
      let doc = {};
      for (const [fileHeader, sysKey] of activeMapping) {
        if (row[fileHeader] !== undefined) {
          doc[sysKey] = row[fileHeader].toString().trim();
        }
      }

      // Check essential fields (the absolute minimum needed to create a record)
      if (!doc.name) {
        // If name is missing, we really can't create a student, but we can set it to a placeholder if requested.
        // For now, let's keep name as the only "hard" requirement, or set it to "Unknown Student"
        doc.name = doc.name || 'Unknown Student';
      }

      // Handle admission year
      let admissionYear;
      if (doc.admissionDate) {
        admissionYear = new Date(doc.admissionDate).getFullYear();
      } else {
        admissionYear = new Date().getFullYear();
        doc.admissionDate = new Date().toISOString().split('T')[0];
      }

      // Format className correctly (same as manual)
      doc.className = formatClassCode(doc.className || '00');

      // Generate unique student ID (same as manual)
      const studentId = await generateStudentId(schoolId, doc.className, admissionYear, db);
      
      // Construct student document in EXACT same format as manual input
      const student = {
        studentId,
        name: doc.name,
        gender: doc.gender || null,
        dateOfBirth: doc.dateOfBirth || null,
        phone: doc.phone || null,
        email: doc.email || null,
        address: doc.address || null,
        fatherName: doc.fatherName || null,
        motherName: doc.motherName || null,
        fatherPhone: doc.fatherPhone || null,
        motherPhone: doc.motherPhone || null,
        className: doc.className,
        section: doc.section || 'A', // Default to 'A' if missing
        rollNumber: parseInt(doc.rollNumber) || (totalProcessed + 1), // Default roll number
        bloodGroup: doc.bloodGroup || null,
        emergencyContact: doc.emergencyContact || null,
        admissionDate: doc.admissionDate,
        admissionYear: admissionYear,
        profilePicture: null,
        schoolId: parseInt(schoolId),
        password_hash: hashedPassword,
        role: 'student',
        permissions: [
          'view_assignments',
          'view_grades',
          'view_timetable',
          'view_attendance'
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null
      };

      // Insert into students collection
      await db.collection('students').insertOne(student);

      // Parent handling (only if fatherPhone exists)
      if (doc.fatherPhone) {
        const existingParent = await db.collection('parents').findOne({
          $or: [
            { phone: doc.fatherPhone },
            { email: doc.email ? doc.email : null }
          ].filter(condition => condition)
        });

        if (!existingParent) {
          const parent = {
            name: doc.fatherName || `${doc.name}'s Father`,
            phone: doc.fatherPhone,
            email: doc.email || null,
            password_hash: hashedPassword,
            role: 'parent',
            schoolId: parseInt(schoolId),
            children: [studentId],
            permissions: [
              'view_child_grades',
              'view_child_attendance'
            ],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: null
          };
          await db.collection('parents').insertOne(parent);
        } else {
          await db.collection('parents').updateOne(
            { _id: existingParent._id },
            { $addToSet: { children: studentId }, $set: { updatedAt: new Date().toISOString() } }
          );
        }
      }

      totalProcessed++;
      
      // Update progress in DB periodically
      if (totalProcessed % 10 === 0) {
        await db.collection('import_jobs').updateOne(
          { _id: new ObjectId(jobId) },
          { $set: { processedRows: totalProcessed, errors: errorCount, updatedAt: new Date().toISOString() } }
        );
      }
    } catch (err) {
      console.error('Row process error:', err);
      errorCount++;
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
     let rows = [];
     parseString(csvString, { headers: true, skipLines: 0 })
       .on('data', row => {
          rows.push(row);
       })
       .on('end', async () => {
           // Update totalRows once we know it
           await db.collection('import_jobs').updateOne(
              { _id: new ObjectId(jobId) },
              { $set: { totalRows: rows.length } }
           );

           // Process rows sequentially to avoid race conditions in ID generation
           for (const row of rows) {
             await processRow(row);
           }
           
           await db.collection('import_jobs').updateOne(
              { _id: new ObjectId(jobId) },
              { $set: { status: 'completed', processedRows: totalProcessed, totalRows: rows.length, errors: errorCount, updatedAt: new Date().toISOString() } }
           );
           resolve();
       })
       .on('error', reject);
  });
}

export default router;
