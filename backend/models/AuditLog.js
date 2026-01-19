const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'entry_created',
      'entry_updated',
      'entry_deleted',
      'dependent_added',
      'dependent_removed',
      'access_requested',
      'access_approved',
      'access_rejected',
      'vault_viewed',
      'settings_updated',
    ],
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    enum: ['assets', 'liabilities', 'insurance', 'contacts', 'emergency', 'notes', null],
    default: null,
  },
  details: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Index for efficient queries
auditLogSchema.index({ ownerId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
