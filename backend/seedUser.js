const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedUser = async () => {
  try {
    await connectDB();

    const email = 'jobseeker@test.com';
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`Test user already exists: ${email}`);
    } else {
      await User.create({
        name: 'Test Job Seeker',
        email,
        password: 'password123',
        role: 'jobseeker'
      });
      console.log(`Created test user: ${email}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

seedUser();
