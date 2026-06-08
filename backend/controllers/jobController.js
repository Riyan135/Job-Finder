const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const filter = { isApproved: true, status: 'Active' };
    const reqQuery = { ...req.query };
    const query = Job.find({ ...filter, ...reqQuery }).populate('company', 'name email');
    const jobs = await query;
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Employer only)
exports.createJob = async (req, res) => {
  try {
    // Add user to req.body
    req.body.employer = req.user.id;

    // Ensure new job is approved
  req.body.isApproved = true;
  const job = await Job.create(req.body);

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Job Seeker only)
exports.applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Extract form fields
    const { fullName, email, mobile, location, qualification, experience, currentSalary, expectedSalary, noticePeriod, coverLetter } = req.body;
    const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : null;

    // Check if user already applied
    const existingApplication = await Application.findOne({ job: req.params.id, applicant: req.user.id });
    if (existingApplication) {
      return res.status(400).json({ success: false, error: 'You have already applied for this job' });
    }

    // Basic Mock Skill Gap & ATS Logic
    // In reality, this would extract text from req.file (resume) and compare to job.requiredSkills
    const userSkills = req.body.skills ? JSON.parse(req.body.skills) : ['JavaScript', 'React', 'HTML', 'CSS']; // mocked user skills
    const requiredSkills = job.requiredSkills || [];
    
    let matchCount = 0;
    const missingSkills = [];

    requiredSkills.forEach(skill => {
      if (userSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())) {
        matchCount++;
      } else {
        missingSkills.push(skill);
      }
    });

    const skillMatchPercentage = requiredSkills.length > 0 
      ? Math.round((matchCount / requiredSkills.length) * 100) 
      : 100;

    // Mock ATS Score between 60 and 98 based on skill match
    const atsScore = Math.floor(skillMatchPercentage * 0.8) + Math.floor(Math.random() * 20);

    const application = await Application.create({
      job: req.params.id,
      applicant: req.user.id,
      fullName,
      email,
      mobile,
      location,
      qualification,
      experience,
      currentSalary,
      expectedSalary,
      noticePeriod,
      coverLetter,
      resumeUrl,
      skillMatchPercentage,
      missingSkills,
      atsScore
    });

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name email');

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer who posted it)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Make sure the logged-in employer is the owner of the job
    if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this job'
      });
    }

    await job.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Search jobs with filters
// @route   GET /api/jobs/search?keyword=&location=&salary=
// @access  Public
exports.searchJobs = async (req, res) => {
  try {
    const { keyword, location, salary, type } = req.query;
    const filter = {};

    // Keyword: support multiple terms separated by '/' or ','
    if (keyword) {
      // Split on slash or comma, trim spaces, ignore empty parts
      const parts = keyword.split(/[\/|,]/).map(p => p.trim()).filter(p => p);
      // Build a case‑insensitive OR regex, e.g. "Picker|Packer"
      const regexPattern = parts.join('|');
      const keywordRegex = new RegExp(regexPattern, 'i');
      filter.$or = [
        { title: keywordRegex },
        { description: keywordRegex },
        { requiredSkills: keywordRegex }
      ];
    }

    // Job Type filter
    if (type && type !== 'All Types') {
      filter.jobType = new RegExp(`^${type}$`, 'i');
    }

    // Location filter (case-insensitive partial match)
    if (location) {
      filter.location = new RegExp(location, 'i');
    }

    // Minimum salary filter
    if (salary && Number(salary) > 0) {
      filter.salary = { $gte: Number(salary) };
    }

    // Ensure only approved and active jobs are returned
    filter.isApproved = true;
    filter.status = 'Active';

    let jobs = await Job.find(filter).populate('company', 'name');
    
    // Map jobs to return company name as string to match frontend expectations
    jobs = jobs.map(j => {
      const jobObj = j.toObject();
      if (jobObj.company && jobObj.company.name) {
        jobObj.company = jobObj.company.name;
      }
      return jobObj;
    });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
