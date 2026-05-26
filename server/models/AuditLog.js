const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    index: true // Indexed for faster searching/filtering
  },
  details: {
    type: String
  },
  targetModel: {
    type: String,
    enum: ['User', 'Course', 'Settings', 'System', 'Other'], // Add relevant models here
    default: 'Other'
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  ipAddress: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
