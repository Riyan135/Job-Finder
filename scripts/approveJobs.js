// scripts/approveJobs.js
const mongoose = require('mongoose');
require('dotenv').config();
const Job = require('../models/Job');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobfinder', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const result = await Job.updateMany({}, { isApproved: true, status: 'Active' });
    console.log('Jobs updated:', result.nModified || result.modifiedCount);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
