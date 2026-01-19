const express = require('express');
const AccessRequest = require('../models/AccessRequest');
const Dependent = require('../models/Dependent');
const KnowledgeEntry = require('../models/KnowledgeEntry');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Request access (dependent)
router.post('/request', auth, authorize('dependent'), async (req, res) => {
  try {
    const { ownerId, reason } = req.body;

    // Check if relationship exists
    const relationship = await Dependent.findOne({
      ownerId,
      dependentId: req.user._id,
    });

    if (!relationship) {
      return res.status(403).json({
        message: 'You are not a registered dependent for this owner'
      });
    }

    // Check if owner is inactive
    const owner = await User.findById(ownerId);
    if (!owner.isInactive) {
      return res.status(400).json({
        message: 'Access can only be requested when the owner is inactive'
      });
    }

    // Check for existing pending request
    const existingRequest = await AccessRequest.findOne({
      ownerId,
      dependentId: req.user._id,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({
        message: 'You already have a pending request for this owner'
      });
    }

    // Create request
    const accessRequest = new AccessRequest({
      ownerId,
      dependentId: req.user._id,
      reason,
    });

    await accessRequest.save();

    // Populate the ownerId field before returning
    await accessRequest.populate('ownerId', 'name email');

    // Create audit log
    await AuditLog.create({
      ownerId,
      action: 'access_requested',
      performedBy: req.user._id,
      details: `Access requested by dependent: ${req.user.email}`,
    });

    res.status(201).json(accessRequest);
  } catch (error) {
    console.error('Request access error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my requests (dependent)
router.get('/my-requests', auth, authorize('dependent'), async (req, res) => {
  try {
    const requests = await AccessRequest.find({ dependentId: req.user._id })
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending requests (admin)
router.get('/pending', auth, authorize('admin'), async (req, res) => {
  try {
    const requests = await AccessRequest.find({ status: 'pending' })
      .populate('ownerId', 'name email isInactive lastActivityAt')
      .populate('dependentId', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all requests (admin)
router.get('/all', auth, authorize('admin'), async (req, res) => {
  try {
    const requests = await AccessRequest.find()
      .populate('ownerId', 'name email isInactive')
      .populate('dependentId', 'name email')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve request (admin)
router.post('/:id/approve', auth, authorize('admin'), async (req, res) => {
  try {
    const { adminNote } = req.body;

    const request = await AccessRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update request
    request.status = 'approved';
    request.adminNote = adminNote || '';
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    // Grant access to dependent
    const dependent = await Dependent.findOne({
      ownerId: request.ownerId,
      dependentId: request.dependentId,
    });

    if (dependent) {
      dependent.accessGranted = true;
      await dependent.save();
    }

    // Create audit log
    await AuditLog.create({
      ownerId: request.ownerId,
      action: 'access_approved',
      performedBy: req.user._id,
      details: `Access approved by admin for dependent`,
    });

    res.json(request);
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject request (admin)
router.post('/:id/reject', auth, authorize('admin'), async (req, res) => {
  try {
    const { adminNote } = req.body;

    const request = await AccessRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update request
    request.status = 'rejected';
    request.adminNote = adminNote || '';
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    // Create audit log
    await AuditLog.create({
      ownerId: request.ownerId,
      action: 'access_rejected',
      performedBy: req.user._id,
      details: `Access rejected by admin`,
    });

    res.json(request);
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// View owner's vault (dependent with approved access)
router.get('/vault/:ownerId', auth, authorize('dependent'), async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Check if access is granted
    const relationship = await Dependent.findOne({
      ownerId,
      dependentId: req.user._id,
      accessGranted: true,
    });

    if (!relationship) {
      return res.status(403).json({
        message: 'Access not granted. Please request access first.'
      });
    }

    // Get permitted categories
    const permittedCategories = Object.keys(relationship.permissions)
      .filter(cat => relationship.permissions[cat]);

    if (permittedCategories.length === 0) {
      return res.status(403).json({
        message: 'No categories permitted'
      });
    }

    // Get entries for permitted categories
    const entries = await KnowledgeEntry.find({
      ownerId,
      category: { $in: permittedCategories },
    }).sort({ category: 1, updatedAt: -1 });

    // Create audit log
    await AuditLog.create({
      ownerId,
      action: 'vault_viewed',
      performedBy: req.user._id,
      details: `Vault viewed by dependent`,
    });

    res.json({
      entries,
      permissions: relationship.permissions,
    });
  } catch (error) {
    console.error('View vault error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get audit logs (owner)
router.get('/logs', auth, authorize('owner'), async (req, res) => {
  try {
    const logs = await AuditLog.find({ ownerId: req.user._id })
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
