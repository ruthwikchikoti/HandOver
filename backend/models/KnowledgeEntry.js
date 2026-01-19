const mongoose = require('mongoose');

const knowledgeEntrySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['assets', 'liabilities', 'insurance', 'contacts', 'emergency', 'notes'],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
knowledgeEntrySchema.index({ ownerId: 1, category: 1 });

module.exports = mongoose.model('KnowledgeEntry', knowledgeEntrySchema);
