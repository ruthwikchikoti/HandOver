const mongoose = require('mongoose');

const dependentSchema = new mongoose.Schema({
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
  permissions: {
    assets: { type: Boolean, default: false },
    liabilities: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false },
    contacts: { type: Boolean, default: false },
    emergency: { type: Boolean, default: false },
    notes: { type: Boolean, default: false },
  },
  accessGranted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Ensure unique owner-dependent relationship
dependentSchema.index({ ownerId: 1, dependentId: 1 }, { unique: true });

module.exports = mongoose.model('Dependent', dependentSchema);
