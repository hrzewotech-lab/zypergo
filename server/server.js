const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zypergo', {
  serverSelectionTimeoutMS: 5000,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ZYPERGO Backend is running' });
});


const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

const supportRoutes = require('./routes/supportRoutes');
app.use('/api/support', supportRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const raiderRoutes = require('./routes/raiderRoutes');
app.use('/api/raider', raiderRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const partnerRoutes = require('./routes/partnerRoutes');
app.use('/api/partner', partnerRoutes);

const hubRoutes = require('./routes/hubRoutes');
app.use('/api/hub', hubRoutes);

const scanRoutes = require('./routes/scanRoutes');
app.use('/api/scan', scanRoutes);

const manifestRoutes = require('./routes/manifestRoutes');
app.use('/api/manifest', manifestRoutes);

const dispatchRoutes = require('./routes/dispatchRoutes');
app.use('/api/dispatch', dispatchRoutes);

const pricingRoutes = require('./routes/pricingRoutes');
app.use('/api/pricing', pricingRoutes);

const serviceabilityRoutes = require('./routes/serviceabilityRoutes');
app.use('/api/serviceability', serviceabilityRoutes);

const returnRoutes = require('./routes/returnRoutes');
app.use('/api/returns', returnRoutes);

const ndrRoutes = require('./routes/ndrRoutes');
app.use('/api/ndr', ndrRoutes);

const financeRoutes = require('./routes/financeRoutes');
app.use('/api/finance-settlements', financeRoutes);

const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);

const addressRoutes = require('./routes/addressRoutes');
app.use('/api/addresses', addressRoutes);

const enquiryRoutes = require('./routes/enquiryRoutes');
app.use('/api/enquiries', enquiryRoutes);

const blogRoutes = require('./routes/blogRoutes');
app.use('/api/blogs', blogRoutes);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please kill the process using this port or change the PORT in .env`);
      process.exit(1);
    } else {
      console.error('Server error:', e);
    }
  });
}

module.exports = app;
