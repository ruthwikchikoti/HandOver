const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const vaultRoutes = require('./routes/vault');
const dependentsRoutes = require('./routes/dependents');
const accessRoutes = require('./routes/access');
const usersRoutes = require('./routes/users');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/dependents', dependentsRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Inactivity checker cron job - runs every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running inactivity check...');
  try {
    const owners = await User.find({ role: 'owner' });

    for (const owner of owners) {
      const now = new Date();
      const lastActivity = new Date(owner.lastActivityAt);
      const diffTime = Math.abs(now - lastActivity);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const shouldBeInactive = diffDays >= owner.inactivityDays;

      if (shouldBeInactive !== owner.isInactive) {
        owner.isInactive = shouldBeInactive;
        await owner.save();
        console.log(`User ${owner.email} inactivity status changed to: ${shouldBeInactive}`);
      }
    }
  } catch (error) {
    console.error('Inactivity check error:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all interfaces for mobile device access

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`For mobile devices, use: http://10.51.4.185:${PORT}`);
});
