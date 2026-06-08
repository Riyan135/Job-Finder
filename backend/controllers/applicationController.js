const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Get current user's applications (job seeker)
// @route   GET /api/applications/mine
// @access  Private (Job Seeker)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location salary')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all applicants for a specific job (employer)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer)
exports.getJobApplicants = async (req, res) => {
  try {
    // Verify the job exists and belongs to this employer
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    const ownerId = job.company || job.employer;
    if (!ownerId || ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view applicants for this job'
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update application status (employer)
// @route   PUT /api/applications/:id/status
// @access  Private (Employer)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status value
    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Verify the employer owns the job this application belongs to
    const ownerId = application.job.company || application.job.employer;
    if (!ownerId || ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this application'
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
