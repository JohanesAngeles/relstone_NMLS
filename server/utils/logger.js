const AuditLog = require('../models/AuditLog');

/**
 * Logs an admin or user action to the database.
 *
 * @param {String} userId      - ID of the user performing the action
 * @param {String} action      - Short action key (e.g. 'DELETED_USER', 'LOGIN')
 * @param {String} details     - Human-readable description
 * @param {String} targetModel - Model affected: 'User'|'Course'|'Settings'|'System'|'Other'
 * @param {String} targetId    - ID of the affected document (optional)
 * @param {String} ipAddress   - IP address from req.ip (optional)
 */
const logAction = async (
  userId,
  action,
  details,
  targetModel = 'Other',
  targetId    = null,
  ipAddress   = null
) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      details,
      targetModel,
      targetId,
      ipAddress,
    });
  } catch (error) {
    // Never crash the main request if logging fails
    console.error('Failed to log action:', error.message);
  }
};

module.exports = logAction;