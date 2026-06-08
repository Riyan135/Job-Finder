const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const connectDB = require('./config/db');

dotenv.config();

const seedJobs = async () => {
    try {
        await connectDB();
        
        // Find or create a dummy employer
        let employer = await User.findOne({ role: 'employer' });
        if (!employer) {
            employer = await User.create({
                name: 'Tech Corp Admin',
                email: 'admin@techcorp.com',
                password: 'password123',
                role: 'employer'
            });
        }

        // Clear existing jobs
        await Job.deleteMany({});

        const jobs = [
            {
                title: 'Software Developer',
                company: 'Tata Consultancy Services (TCS)',
                location: 'Bangalore',
                type: 'Full-time',
                salary: 1000000,
                description: 'We are looking for a skilled Software Developer.',
                requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
                employer: employer._id
            },
            {
                title: 'Data Analyst',
                company: 'Infosys Ltd.',
                location: 'Hyderabad',
                type: 'Full-time',
                salary: 800000,
                description: 'Seeking a Data Analyst to extract insights.',
                requiredSkills: ['Python', 'SQL', 'Power BI', 'Excel', 'Pandas'],
                employer: employer._id
            },
            {
                title: 'Full Stack Engineer',
                company: 'Wipro Technologies',
                location: 'Pune',
                type: 'Full-time',
                salary: 1400000,
                description: 'Join our team as a Full Stack Engineer.',
                requiredSkills: ['Java', 'Spring Boot', 'Angular', 'AWS', 'Docker'],
                employer: employer._id
            },
            {
                title: 'Frontend Developer (React)',
                company: 'Razorpay',
                location: 'Remote',
                type: 'Full-time',
                salary: 1800000,
                description: 'Remote frontend developer position.',
                requiredSkills: ['React', 'TypeScript', 'Redux', 'CSS/SASS', 'Jest'],
                employer: employer._id
            },
            {
                title: 'ML Engineering Intern',
                company: 'Zomato',
                location: 'Remote',
                type: 'Internship',
                salary: 360000,
                description: 'Looking for a passionate ML intern.',
                requiredSkills: ['Python', 'TensorFlow', 'NLP', 'Scikit-learn'],
                employer: employer._id
            },
            {
                title: 'DevOps Engineer',
                company: 'Flipkart',
                location: 'Bangalore',
                type: 'Full-time',
                salary: 2400000,
                description: 'Senior DevOps Engineer needed.',
                requiredSkills: ['Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'Linux', 'AWS'],
                employer: employer._id
            }
        ];

        await Job.insertMany(jobs);
        console.log('Database seeded with mock jobs!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedJobs();
