const express = require('express');
const { analyzeResume, recommendLearning, chatbot } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/analyze-resume', protect, authorize('jobseeker'), analyzeResume);
router.post('/recommend-learning', protect, recommendLearning);
router.post('/chat', protect, chatbot);

module.exports = router;
