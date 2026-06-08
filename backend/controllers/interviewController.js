const Application = require('../models/Application');
const { createNotification } = require('../controllers/notificationController');
const sendEmail = require('../utils/email');

function ownsApplicationJob(application, userId) {
  const ownerId = application.job.company || application.job.employer;
  return ownerId && ownerId.toString() === userId;
}

// @desc    Schedule an interview for an application
// @route   POST /api/interviews/:appId/schedule
// @access  Private (Employer/Company)
exports.scheduleInterview = async (req, res) => {
  try {
    const {
      interviewDate,
      interviewTime,
      interviewMode,
      interviewLink,
      interviewLocation,
      interviewInstructions,
      interviewType,
      interviewRound,
      date,
      time,
      duration,
      timeZone,
      interviewer,
      meetingLink,
      officeAddress,
      platform,
      notes
    } = req.body;

    const application = await Application.findById(req.params.appId)
      .populate('job')
      .populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    if (!ownsApplicationJob(application, req.user.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to schedule interview for this application' });
    }

    const scheduledDate = interviewDate || date;
    const scheduledTime = interviewTime || time;
    const mode = interviewMode || interviewType;
    const link = interviewLink || meetingLink;
    const location = interviewLocation || officeAddress;
    const instructions = interviewInstructions || notes;

    application.interviewDate = scheduledDate;
    application.interviewTime = scheduledTime;
    application.interviewMode = mode === 'Telephonic' ? 'Phone Call' : mode;
    if (link) application.interviewLink = link;
    if (location) application.interviewLocation = location;
    if (instructions) application.interviewInstructions = instructions;
    application.status = 'Interview Scheduled';
    await application.save();

    await createNotification(
      application.applicant._id || application.applicant,
      'InterviewScheduled',
      `Your interview for "${application.job.title}" has been scheduled.`,
      { link: '/my-applications', email: null }
    );

    const recipientEmail = application.email || application.applicant?.email;
    if (recipientEmail) {
      const candidateName = application.fullName || application.applicant?.name || 'Candidate';
      const message = [
        `Hi ${candidateName},`,
        '',
        `Your interview for "${application.job.title}" has been scheduled.`,
        `Date: ${scheduledDate}`,
        `Time: ${scheduledTime}${timeZone ? ` (${timeZone})` : ''}`,
        `Type: ${mode}`,
        interviewRound ? `Round: ${interviewRound}` : null,
        duration ? `Duration: ${duration}` : null,
        interviewer?.name ? `Interviewer: ${interviewer.name}` : null,
        interviewer?.email ? `Interviewer Email: ${interviewer.email}` : null,
        interviewer?.department ? `Department: ${interviewer.department}` : null,
        platform ? `Platform: ${platform}` : null,
        link ? `Meeting Link: ${link}` : null,
        location ? `Office Address: ${location}` : null,
        instructions ? `Notes: ${instructions}` : null,
        '',
        'Regards,',
        'SmartJobFinder'
      ].filter(Boolean).join('\n');

      await sendEmail({
        to: recipientEmail,
        subject: `Interview scheduled for ${application.job.title}`,
        text: message
      });
    }

    res.status(200).json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update interview details
// @route   PUT /api/interviews/:appId
// @access  Private (Employer/Company)
exports.updateInterview = async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    if (!ownsApplicationJob(application, req.user.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to update interview for this application' });
    }

    const updates = ['interviewDate', 'interviewTime', 'interviewMode', 'interviewLink', 'interviewLocation', 'interviewInstructions'];
    updates.forEach((field) => {
      if (req.body[field] !== undefined) application[field] = req.body[field];
    });
    await application.save();

    await createNotification(
      application.applicant._id || application.applicant,
      'InterviewScheduled',
      `Your interview details for "${application.job.title}" have been updated.`,
      { link: '/my-applications' }
    );

    res.status(200).json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Cancel interview
// @route   DELETE /api/interviews/:appId
// @access  Private (Employer/Company)
exports.cancelInterview = async (req, res) => {
  try {
    const application = await Application.findById(req.params.appId).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    if (!ownsApplicationJob(application, req.user.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to cancel interview for this application' });
    }

    application.interviewDate = undefined;
    application.interviewTime = undefined;
    application.interviewMode = undefined;
    application.interviewLink = undefined;
    application.interviewLocation = undefined;
    application.interviewInstructions = undefined;
    application.status = 'Under Review';
    await application.save();

    await createNotification(
      application.applicant._id || application.applicant,
      'InterviewScheduled',
      `Your interview for "${application.job.title}" has been cancelled. Please await further updates.`,
      { link: '/my-applications' }
    );

    res.status(200).json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
