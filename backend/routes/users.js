const express = require('express');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats (admin)
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const owners = await User.countDocuments({ role: 'owner' });
    const dependents = await User.countDocuments({ role: 'dependent' });
    const inactiveOwners = await User.countDocuments({ role: 'owner', isInactive: true });

    res.json({
      total: totalUsers,
      owners,
      dependents,
      inactiveOwners,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update owner settings (inactivity days)
router.put('/settings', auth, authorize('owner'), async (req, res) => {
  try {
    const { inactivityDays, name } = req.body;

    const user = await User.findById(req.user._id);

    if (inactivityDays !== undefined) {
      if (inactivityDays < 1 || inactivityDays > 365) {
        return res.status(400).json({
          message: 'Inactivity days must be between 1 and 365'
        });
      }
      user.inactivityDays = inactivityDays;
    }

    if (name) {
      user.name = name;
    }

    await user.save();

    // Create audit log
    await AuditLog.create({
      ownerId: req.user._id,
      action: 'settings_updated',
      performedBy: req.user._id,
      details: `Settings updated`,
    });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      inactivityDays: user.inactivityDays,
      isInactive: user.isInactive,
      lastActivityAt: user.lastActivityAt,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
