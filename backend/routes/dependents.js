const express = require('express');
const Dependent = require('../models/Dependent');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all dependents for owner
router.get('/', auth, authorize('owner'), async (req, res) => {
  try {
    const dependents = await Dependent.find({ ownerId: req.user._id })
      .populate('dependentId', 'name email')
      .sort({ createdAt: -1 });
    res.json(dependents);
  } catch (error) {
    console.error('Get dependents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get owners for dependent (who added me)
router.get('/owners', auth, authorize('dependent'), async (req, res) => {
  try {
    const relationships = await Dependent.find({ dependentId: req.user._id })
      .populate('ownerId', 'name email isInactive lastActivityAt')
      .sort({ createdAt: -1 });
    res.json(relationships);
  } catch (error) {
    console.error('Get owners error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add dependent by email
router.post('/', auth, authorize('owner'), async (req, res) => {
  try {
    const { email, permissions } = req.body;

    // Find dependent user
    const dependentUser = await User.findOne({ email, role: 'dependent' });
    if (!dependentUser) {
      return res.status(404).json({
        message: 'User not found. Make sure they are registered as a dependent.'
      });
    }

    // Check if already added
    const existing = await Dependent.findOne({
      ownerId: req.user._id,
      dependentId: dependentUser._id,
    });

    if (existing) {
      return res.status(400).json({ message: 'Dependent already added' });
    }

    // Create dependent relationship
    const dependent = new Dependent({
      ownerId: req.user._id,
      dependentId: dependentUser._id,
      permissions: permissions || {},
    });

    await dependent.save();

    // Populate dependent info
    await dependent.populate('dependentId', 'name email');

    // Create audit log
    await AuditLog.create({
      ownerId: req.user._id,
      action: 'dependent_added',
      performedBy: req.user._id,
      details: `Added dependent: ${dependentUser.email}`,
    });

    res.status(201).json(dependent);
  } catch (error) {
    console.error('Add dependent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update dependent permissions
router.put('/:id', auth, authorize('owner'), async (req, res) => {
  try {
    const { permissions } = req.body;

    const dependent = await Dependent.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!dependent) {
      return res.status(404).json({ message: 'Dependent not found' });
    }

    dependent.permissions = permissions;
    await dependent.save();

    await dependent.populate('dependentId', 'name email');

    res.json(dependent);
  } catch (error) {
    console.error('Update dependent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove dependent
router.delete('/:id', auth, authorize('owner'), async (req, res) => {
  try {
    const dependent = await Dependent.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    }).populate('dependentId', 'email');

    if (!dependent) {
      return res.status(404).json({ message: 'Dependent not found' });
    }

    const email = dependent.dependentId.email;
    await dependent.deleteOne();

    // Create audit log
    await AuditLog.create({
      ownerId: req.user._id,
      action: 'dependent_removed',
      performedBy: req.user._id,
      details: `Removed dependent: ${email}`,
    });

    res.json({ message: 'Dependent removed' });
  } catch (error) {
    console.error('Remove dependent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
