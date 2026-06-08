const Notification = require('../models/Notification');
const sendEmail = require('../utils/email');

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { read: true } },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Helper to create and optionally email notification
exports.createNotification = async (userId, type, message, extra = {}) => {
  try {
    const notification = await Notification.create({ user: userId, type, message, ...extra });
    // Send email if email fields provided in extra
    if (extra.email) {
      await sendEmail({
        to: extra.email,
        subject: `${type} Notification`,
        text: message,
        html: `<p>${message}</p>`
      });
    }
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};
