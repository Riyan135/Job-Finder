const Profile = require('../models/Profile');
const Job = require('../models/Job');
const multer = require('multer');
const path = require('path');

// --- Multer config for resume uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname) {
    return cb(null, true);
  }
  cb(new Error('Only .pdf, .doc and .docx files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// @desc    Get current user's profile
// @route   GET /api/profile/me
// @access  Private
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', 'name email role')
      .populate('savedJobs', 'title company location salary');

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found. Please create a profile first.'
      });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create or update user profile
// @route   POST /api/profile
// @access  Private
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const {
      phone, location, bio,
      education, skills, experience, certifications
    } = req.body;

    // Build profile object
    const profileFields = { user: req.user.id };
    if (phone !== undefined) profileFields.phone = phone;
    if (location !== undefined) profileFields.location = location;
    if (bio !== undefined) profileFields.bio = bio;
    if (education !== undefined) profileFields.education = education;
    if (skills !== undefined) profileFields.skills = skills;
    if (experience !== undefined) profileFields.experience = experience;
    if (certifications !== undefined) profileFields.certifications = certifications;

    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, runValidators: true }
      );

      return res.status(200).json({ success: true, data: profile });
    }

    // Create new profile
    profile = await Profile.create(profileFields);
    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Upload resume
// @route   POST /api/profile/resume
// @access  Private
exports.uploadResume = [
  upload.single('resume'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Please upload a resume file (.pdf, .doc, .docx)'
        });
      }

      const profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { resumeUrl: req.file.path },
        { new: true, upsert: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        data: { resumeUrl: profile.resumeUrl }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
];

// @desc    Save a job to profile
// @route   PUT /api/profile/savejob/:jobId
// @access  Private
exports.saveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found. Please create a profile first.'
      });
    }

    // Check if job is already saved
    if (profile.savedJobs.includes(req.params.jobId)) {
      return res.status(400).json({
        success: false,
        error: 'Job is already saved'
      });
    }

    profile.savedJobs.push(req.params.jobId);
    await profile.save();

    res.status(200).json({ success: true, data: profile.savedJobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Unsave a job from profile
// @route   PUT /api/profile/unsavejob/:jobId
// @access  Private
exports.unsaveJob = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found. Please create a profile first.'
      });
    }

    // Check if job is actually saved
    const jobIndex = profile.savedJobs.indexOf(req.params.jobId);
    if (jobIndex === -1) {
      return res.status(400).json({
        success: false,
        error: 'Job is not in your saved list'
      });
    }

    profile.savedJobs.splice(jobIndex, 1);
    await profile.save();

    res.status(200).json({ success: true, data: profile.savedJobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all saved jobs
// @route   GET /api/profile/savedjobs
// @access  Private
exports.getSavedJobs = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('savedJobs');

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found. Please create a profile first.'
      });
    }

    res.status(200).json({
      success: true,
      count: profile.savedJobs.length,
      data: profile.savedJobs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
