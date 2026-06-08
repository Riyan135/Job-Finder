const User = require('../models/User');
const Job = require('../models/Job');

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    
    // Simplified stats
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        pendingApprovals: 0 // Mocked for now
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a job (Moderation)
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    await job.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
