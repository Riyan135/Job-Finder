const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { scheduleInterview, updateInterview, cancelInterview } = require('../controllers/interviewController');

const router = express.Router();

router.use(protect);
router.use(authorize('employer', 'admin', 'company'));

// Schedule a new interview
router.post('/:appId/schedule', scheduleInterview);

// Update existing interview details (reschedule, edit)
router.put('/:appId', updateInterview);

// Cancel interview
router.delete('/:appId', cancelInterview);

module.exports = router;
