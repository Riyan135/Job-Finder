const express = require('express');
const { getStats, deleteJob } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.delete('/jobs/:id', deleteJob);

module.exports = router;
