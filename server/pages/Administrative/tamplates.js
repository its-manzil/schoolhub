import express from 'express';
import multer from 'multer';
import { getDB } from '../../config/db.js';
import { verifyToken } from '../../middleware/auth.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Fixed categories and their types
const CATEGORIES = {
  'Academic': ['Report Card', 'Lesson Plan', 'Progress Report'],
  'Administrative': ['ID Card', 'Certificate', 'Letterhead'],
  'Finance': ['Receipt', 'Salary Slip'],
  'General': ['Certificate', 'Newsletter']
};

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF, DOC, DOCX, and image files
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and image files are allowed.'), false);
    }
  }
});

// Get categories and types
router.get('/categories', verifyToken, (req, res) => {
  res.json({
    success: true,
    data: CATEGORIES
  });
});

// Get all templates for a school
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;

    // Get schoolId from user token
    let schoolId;
    if (user.role === 'schooladmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'administrative') {
      const adminData = await db.collection('administratives').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Administrative data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const templates = await db.collection('templates')
      .find({ schoolId })
      .sort({ createdAt: -1 })
      .toArray();

    // Convert file data to base64 for frontend
    const templatesWithFiles = templates.map(template => ({
      ...template,
      fileData: template.fileData ? template.fileData.toString('base64') : null,
      thumbnailUrl: template.thumbnailUrl ? template.thumbnailUrl.toString('base64') : null
    }));

    res.json({
      success: true,
      data: templatesWithFiles
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get single template by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { id } = req.params;

    // Get schoolId from user token
    let schoolId;
    if (user.role === 'schooladmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'administrative') {
      const adminData = await db.collection('administratives').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Administrative data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find template by ID and schoolId
    const template = await db.collection('templates').findOne({
      _id: new ObjectId(id),
      schoolId
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Convert file data to base64 for frontend
    const responseTemplate = {
      ...template,
      _id: template._id.toString(),
      fileData: template.fileData ? template.fileData.toString('base64') : undefined
    };

    res.status(200).json({
      success: true,
      data: responseTemplate
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create a new template
router.post('/', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { name, category, type, layoutJson } = req.body;
    const file = req.file;

    if (!name || !category || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and type are required'
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Template file is required'
      });
    }

    // Validate category and type
    if (!CATEGORIES[category]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    if (!CATEGORIES[category].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type for selected category'
      });
    }

    // Get schoolId from user token
    let schoolId;
    if (user.role === 'schooladmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'administrative') {
      const adminData = await db.collection('administratives').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Administrative data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const template = {
      name,
      category,
      type,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      fileData: file.buffer,
      layoutJson: layoutJson || null,
      schoolId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('templates').insertOne(template);

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: { 
        ...template, 
        _id: result.insertedId,
        fileData: template.fileData.toString('base64')
      }
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create template',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update a template
router.put('/:id', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { id } = req.params;
    const { name, category, type, layoutJson } = req.body;
    const file = req.file;

    if (!name || !category || !type) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and type are required'
      });
    }

    // Validate category and type
    if (!CATEGORIES[category]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    if (!CATEGORIES[category].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type for selected category'
      });
    }

    // Get schoolId from user token
    let schoolId;
    if (user.role === 'schooladmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'administrative') {
      const adminData = await db.collection('administratives').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Administrative data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = {
      name,
      category,
      type,
      updatedAt: new Date().toISOString()
    };

    // Add layoutJson if provided
    if (layoutJson !== undefined) {
      updateData.layoutJson = layoutJson;
    }

    // Add file data if a new file was uploaded
    if (file) {
      updateData.fileName = file.originalname;
      updateData.fileType = file.mimetype;
      updateData.fileSize = file.size;
      updateData.fileData = file.buffer;
    }

    const result = await db.collection('templates').updateOne(
      { _id: new ObjectId(id), schoolId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Download a template file
router.get('/:id/download', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { id } = req.params;

    // Get schoolId from user token
    let schoolId;
    if (user.role === 'schooladmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'administrative') {
      const adminData = await db.collection('administratives').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Administrative data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const template = await db.collection('templates').findOne({
      _id: new ObjectId(id),
      schoolId
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.set({
      'Content-Type': template.fileType,
      'Content-Disposition': `attachment; filename="${template.fileName}"`
    });

    res.send(template.fileData);
  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download template',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete a template
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const db = getDB();
    const user = req.user;
    const { id } = req.params;

    // Get schoolId from user token
    let schoolId;
    if (user.role === 'schooladmin') {
      const adminData = await db.collection('schooladmins').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'School admin data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else if (user.role === 'administrative') {
      const adminData = await db.collection('administratives').findOne({ _id: new ObjectId(user.id) });
      if (!adminData || !adminData.schoolId) {
        return res.status(404).json({
          success: false,
          message: 'Administrative data not found'
        });
      }
      schoolId = adminData.schoolId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const result = await db.collection('templates').deleteOne(
      { _id: new ObjectId(id), schoolId }
    );

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router;
