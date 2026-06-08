const express = require('express');
const { getJobs, createJob, applyForJob, getJobById, deleteJob, searchJobs } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Search must come before /:id to avoid route conflicts
router.get('/search', searchJobs);

router.route('/')
  .get(getJobs)
  .post(protect, authorize('employer', 'admin'), createJob);

router.route('/:id')
  .get(getJobById)
  .delete(protect, authorize('employer', 'admin'), deleteJob);

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${req.user ? req.user.id : 'unknown'}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.post('/:id/apply', protect, authorize('jobseeker'), upload.single('resume'), applyForJob);

module.exports = router;
