import mongoose from 'mongoose';
import '../env.js'; // Helper to load .env
import Job from '../models/Job.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

const seedJobs = async () => {
    try {
        await connectDB();

        let admin = await User.findOne({ role: 'admin' });

        if (!admin) {
            console.log('No admin found. Creating a temporary admin for seeding...');
            admin = await User.create({
                name: 'Seed Admin',
                email: 'seed_admin@adhyaya.com',
                password: 'password123',
                role: 'admin'
            });
        }

        const jobs = [
            {
                companyName: 'TechCorp Solutions',
                role: 'Frontend Developer Intern',
                salaryRange: '₹15k - ₹25k',
                jobType: 'Internship',
                experienceLevel: 'Fresher',
                requiredSkills: ['React', 'Tailwind', 'JavaScript'],
                applicationType: 'Internal',
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                verifiedStatus: true,
                postedBy: admin._id,
                description: 'We are looking for a passionate Frontend Developer Intern to join our team. You will be working with the latest technologies like React and Tailwind CSS.',
                isActive: true
            },
            {
                companyName: 'InnovateAI',
                role: 'Junior Backend Engineer',
                salaryRange: '₹6LPA - ₹10LPA',
                jobType: 'Full-time',
                experienceLevel: '0-2 Years',
                requiredSkills: ['Node.js', 'MongoDB', 'Express'],
                applicationType: 'Internal',
                deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                verifiedStatus: true,
                postedBy: admin._id,
                description: 'Join our backend team to build scalable APIs and microservices. Experience with Node.js and MongoDB is required.',
                isActive: true
            },
            {
                companyName: 'DataSystems',
                role: 'Data Analyst',
                salaryRange: '₹5LPA - ₹8LPA',
                jobType: 'Full-time',
                experienceLevel: 'Fresher',
                requiredSkills: ['Python', 'SQL', 'Excel'],
                applicationType: 'External',
                applyLink: 'https://datasystems.careers',
                deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                verifiedStatus: true,
                postedBy: admin._id,
                description: 'Great opportunity for data enthusiasts. You will work on analyzing large datasets and providing actionable insights.',
                isActive: true
            }
        ];

        await Job.deleteMany({}); // Clear existing jobs
        await Job.insertMany(jobs);

        console.log('✅ Sample jobs seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding jobs:', error);
        process.exit(1);
    }
};

seedJobs();
