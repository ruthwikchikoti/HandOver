const express = require('express');
const KnowledgeEntry = require('../models/KnowledgeEntry');
const AuditLog = require('../models/AuditLog');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all entries for owner
router.get('/', auth, authorize('owner'), async (req, res) => {
  try {
    const entries = await KnowledgeEntry.find({ ownerId: req.user._id })
      .sort({ updatedAt: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Get entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get entries by category
router.get('/category/:category', auth, authorize('owner'), async (req, res) => {
  try {
    const entries = await KnowledgeEntry.find({
      ownerId: req.user._id,
      category: req.params.category,
    }).sort({ updatedAt: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Get entries by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single entry
router.get('/:id', auth, authorize('owner'), async (req, res) => {
  try {
    const entry = await KnowledgeEntry.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Get entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create entry
router.post('/', auth, authorize('owner'), async (req, res) => {
  try {
    const { category, title, content } = req.body;

    const entry = new KnowledgeEntry({
      ownerId: req.user._id,
      category,
      title,
      content,
    });

    await entry.save();

    // Create audit log
    await AuditLog.create({
      ownerId: req.user._id,
      action: 'entry_created',
      performedBy: req.user._id,
      category,
      details: `Created entry: ${title}`,
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update entry
router.put('/:id', auth, authorize('owner'), async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const entry = await KnowledgeEntry.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    entry.title = title || entry.title;
    entry.content = content || entry.content;
    if (category) entry.category = category;

    await entry.save();

    // Create audit log
    await AuditLog.create({
      ownerId: req.user._id,
      action: 'entry_updated',
      performedBy: req.user._id,
      category: entry.category,
      details: `Updated entry: ${entry.title}`,
    });

    res.json(entry);
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete entry
router.delete('/:id', auth, authorize('owner'), async (req, res) => {
  try {
    const entry = await KnowledgeEntry.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    const { title, category } = entry;
    await entry.deleteOne();

    // Create audit log
    await AuditLog.create({
      ownerId: req.user._id,
      action: 'entry_deleted',
      performedBy: req.user._id,
      category,
      details: `Deleted entry: ${title}`,
    });

    res.json({ message: 'Entry deleted' });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vault stats (counts per category)
router.get('/stats/summary', auth, authorize('owner'), async (req, res) => {
  try {
    const stats = await KnowledgeEntry.aggregate([
      { $match: { ownerId: req.user._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const categoryCounts = {
      assets: 0,
      liabilities: 0,
      insurance: 0,
      contacts: 0,
      emergency: 0,
      notes: 0,
    };

    stats.forEach(stat => {
      categoryCounts[stat._id] = stat.count;
    });

    res.json(categoryCounts);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
