const mongoose = require('mongoose');

const accessRequestSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dependentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminNote: {
    type: String,
    default: '',
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  processedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
accessRequestSchema.index({ status: 1 });
accessRequestSchema.index({ dependentId: 1 });
accessRequestSchema.index({ ownerId: 1 });

module.exports = mongoose.model('AccessRequest', accessRequestSchema);
