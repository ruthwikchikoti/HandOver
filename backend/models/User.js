const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'dependent', 'admin'],
    required: true,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
  inactivityDays: {
    type: Number,
    default: 30,
  },
  isInactive: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Calculate if user is inactive
userSchema.methods.checkInactivity = function() {
  const now = new Date();
  const lastActivity = new Date(this.lastActivityAt);
  const diffTime = Math.abs(now - lastActivity);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= this.inactivityDays;
};

module.exports = mongoose.model('User', userSchema);
