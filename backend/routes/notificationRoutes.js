const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getNotifications, markAsRead, deleteNotification } = require('../controllers/notificationController');

const router = express.Router();

router.use(protect);

// Get all notifications for logged in user
router.get('/', getNotifications);

// Mark a notification as read
router.patch('/:id/read', markAsRead);

// Delete a notification
router.delete('/:id', deleteNotification);

module.exports = router;
