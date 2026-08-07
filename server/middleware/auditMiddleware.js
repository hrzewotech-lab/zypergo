const AuditLog = require('../models/AuditLog');

/**
 * Middleware to log critical administrative actions
 * @param {String} resource - The name of the resource being accessed (e.g., 'Booking', 'Partner')
 */
exports.logAction = (resource) => {
  return async (req, res, next) => {
    // We only want to log when the request finishes successfully.
    // So we hook into res.on('finish', ...)
    res.on('finish', async () => {
      // Only log if it's a modifying action (POST, PUT, PATCH, DELETE) and successful
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
        
        let action = req.method;
        if (req.method === 'POST') action = 'CREATE';
        if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
        if (req.method === 'DELETE') action = 'DELETE';

        const resourceId = req.params.id || null;
        // Don't log passwords or sensitive body parts. For simplicity, we log the whole body here,
        // but in production, we should filter sensitive fields.
        const details = { ...req.body };
        if (details.password) delete details.password;

        try {
          if (req.user && req.user.id) {
            await AuditLog.create({
              user: req.user.id,
              action: action,
              resource: resource,
              resourceId: resourceId,
              details: details,
              ipAddress: req.ip || req.connection.remoteAddress
            });
          }
        } catch (error) {
          console.error('Failed to create audit log:', error);
        }
      }
    });

    next();
  };
};
