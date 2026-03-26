import express from 'express';
import { getDB } from '../../config/db.js';
import { verifyToken, requireSuperAdmin } from '../../middleware/auth.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Change password
router.put('/change-password', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }

    const user = await db.collection('superadmins').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await comparePassword(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid current password' });
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.collection('superadmins').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password_hash: hashedPassword, updatedAt: new Date().toISOString() } }
    );

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

export default router;
