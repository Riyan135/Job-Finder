const express = require('express');
const {
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Job seeker routes
router.get('/mine', authorize('jobseeker'), getMyApplications);

// Employer/Company routes
router.get('/job/:jobId', authorize('employer', 'admin', 'company'), getJobApplicants);
router.put('/:id/status', authorize('employer', 'admin', 'company'), updateApplicationStatus);

module.exports = router;
