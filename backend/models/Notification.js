const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['ApplicationStatus', 'InterviewScheduled', 'General'], required: true },
  message: { type: String, required: true },
  link: { type: String }, // optional URL to related page
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

// Auto-delete after 30 days if expiresAt not set
NotificationSchema.pre('save', function (next) {
  if (!this.expiresAt) {
    const ttl = 30 * 24 * 60 * 60 * 1000; // 30 days
    this.expiresAt = new Date(Date.now() + ttl);
  }
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);
