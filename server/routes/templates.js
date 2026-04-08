import express from 'express';
import templatesController from '../pages/Administrative/tamplates.js';

const router = express.Router();

// Get categories and types
router.get('/categories', templatesController);

// Get all templates
router.get('/', templatesController);

// Get single template by ID
router.get('/:id', templatesController);

// Create new template
router.post('/', templatesController);

// Update template
router.put('/:id', templatesController);

// Download template file
router.get('/:id/download', templatesController);

// Delete template
router.delete('/:id', templatesController);

export default router;
