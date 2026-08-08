const Booking = require('../models/Booking');
const ExceptionNDR = require('../models/ExceptionNDR');
const Transaction = require('../models/Transaction');
const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');

// --- KPI DASHBOARD ---
exports.getDashboardKPIs = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalBookings, inTransit, failed, returns, transactions, exceptions] = await Promise.all([
      Booking.countDocuments({ createdAt: { $gte: today } }),
      Booking.countDocuments({ status: { $in: ['In Transit', 'Out for Delivery', 'Rider On the Way'] } }),
      Booking.countDocuments({ status: 'Failed', createdAt: { $gte: today } }),
      Booking.countDocuments({ status: 'Returned', createdAt: { $gte: today } }),
      Transaction.find({ createdAt: { $gte: today } }),
      ExceptionNDR.find({ status: { $in: ['Open', 'Action Required'] } })
    ]);

    let revenue = 0;
    transactions.forEach(t => {
      if (t.type === 'Payment' && t.status === 'Completed') revenue += t.amount;
    });

    const openExceptions = exceptions.length;
    const slaBreaches = exceptions.filter(e => {
      const diffHours = Math.abs(new Date() - e.createdAt) / 36e5;
      return diffHours > 48; // Simple SLA mock: unresolved > 48h
    }).length;

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        inTransit,
        failed,
        returns,
        revenue,
        openExceptions,
        slaBreaches
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch KPIs' });
  }
};

// --- CHART DATA (Weekly Volume Simulation) ---
exports.getWeeklyChartData = async (req, res) => {
  try {
    // We will generate a structured array for the last 7 days.
    // In a real scenario, this would use MongoDB $group aggregation by day.
    const chartData = [
      { day: 'Mon', successful: 45, failed: 5 },
      { day: 'Tue', successful: 60, failed: 8 },
      { day: 'Wed', successful: 35, failed: 2 },
      { day: 'Thu', successful: 80, failed: 12 },
      { day: 'Fri', successful: 95, failed: 4 },
      { day: 'Sat', successful: 70, failed: 6 },
      { day: 'Sun', successful: 50, failed: 1 }
    ];

    res.status(200).json({ success: true, data: chartData });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch chart data' });
  }
};

// --- CSV EXPORT GENERATOR ---
exports.exportCSV = async (req, res) => {
  try {
    const { type } = req.params; // e.g. 'daily-bookings', 'exceptions'
    
    let csvHeader = '';
    let csvRows = [];

    if (type === 'daily-bookings') {
      const bookings = await Booking.find().limit(100).populate('sender'); // Limiting for safety
      csvHeader = 'TrackingID,Date,Sender,Origin,Destination,Weight,Status,TotalCost\n';
      csvRows = bookings.map(b => 
        `"${b.trackingId}","${b.createdAt.toISOString()}","${b.sender?.name || 'Guest'}","${b.pickupLocation.pincode}","${b.dropLocation.pincode}",${b.packageDetails.weight},"${b.status}",${b.pricing.total}`
      );
    } else if (type === 'exceptions') {
      const exceptions = await ExceptionNDR.find().populate('booking');
      csvHeader = 'ExceptionID,TrackingID,Type,Reason,Status,Date\n';
      csvRows = exceptions.map(e => 
        `"${e._id}","${e.booking?.trackingId || ''}","${e.type}","${e.reason}","${e.status}","${e.createdAt.toISOString()}"`
      );
    } else {
      return res.status(400).json({ success: false, error: 'Invalid report type' });
    }

    const csvContent = csvHeader + csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_report.csv`);
    res.status(200).send(csvContent);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to generate export' });
  }
};

// --- OPERATIONAL REPORTS ---
exports.getOperationalReports = async (req, res) => {
  try {
    const dailyStats = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "Failed"] }, 1, 0] } },
          pendingPickups: { $sum: { $cond: [{ $eq: ["$status", "Created"] }, 1, 0] } }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    const delayedShipments = await Booking.find({
      status: { $in: ['Created', 'In Transit'] },
      updatedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).limit(50).select('trackingId status updatedAt');

    res.json({ success: true, data: { dailyStats, delayedShipments } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch Operational Reports' });
  }
};

// --- BUSINESS ANALYTICS ---
exports.getBusinessAnalytics = async (req, res) => {
  try {
    const topRoutes = await Booking.aggregate([
      {
        $group: {
          _id: { origin: "$pickupLocation.city", destination: "$dropLocation.city" },
          count: { $sum: 1 },
          revenue: { $sum: "$pricing.total" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const formattedRoutes = topRoutes.map(r => ({
      name: `${r._id.origin || 'Unknown'} to ${r._id.destination || 'Unknown'}`,
      bookings: r.count,
      revenue: r.revenue
    }));

    res.json({ success: true, data: { topRoutes } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch Business Analytics' });
  }
};

