import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'admin@cms.com' });
        if (adminExists) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const admin = new User({
            email: 'admin@cms.com',
            password: 'admin123', // Matches README and UI defaults
            role: 'admin'
        });

        await admin.save();
        console.log('Admin user seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin user:', error);
        process.exit(1);
    }
};

seedAdmin();
