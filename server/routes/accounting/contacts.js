import express from 'express';
import { getContacts, createContact, updateContact, deleteContact } from '../../controllers/accounting/contacts.js';

const router = express.Router();

router.get('/', getContacts);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);

export default router;
