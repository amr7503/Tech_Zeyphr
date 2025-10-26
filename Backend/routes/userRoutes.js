const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');

// Get user profile (fallback: empty)
router.get('/:userId', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.params.userId });
    res.json(profile || {});
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update or create user profile - only allow owner (session or body)
router.patch('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // prefer session user if available
    const requester = (req.session && req.session.userId) ? req.session.userId : req.body.userId;
    if (!requester || requester !== userId) {
      return res.status(403).json({ error: 'Forbidden: cannot edit other user profile', requester, target: userId });
    }

    const updates = {};
    const allowed = ['displayName', 'bio', 'location', 'avatarUrl'];
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const profile = await UserProfile.findOneAndUpdate({ userId }, { $set: updates }, { new: true, upsert: true });
    res.json({ message: 'Profile updated', profile });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
