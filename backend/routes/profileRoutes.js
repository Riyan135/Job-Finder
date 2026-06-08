const express = require('express');
const {
  getMyProfile,
  createOrUpdateProfile,
  uploadResume,
  saveJob,
  unsaveJob,
  getSavedJobs
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes below require authentication
router.use(protect);

router.get('/', getMyProfile);
router.put('/', createOrUpdateProfile);
router.post('/', createOrUpdateProfile); // keep post just in case
router.post('/resume', uploadResume); // uploadResume is a [multer, handler] array
router.get('/savedjobs', getSavedJobs);
router.put('/savejob/:jobId', saveJob);
router.put('/unsavejob/:jobId', unsaveJob);

module.exports = router;
