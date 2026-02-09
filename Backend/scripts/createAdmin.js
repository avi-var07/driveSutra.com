import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@drivesutrago.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists with email: admin@drivesutrago.com');
      console.log('To reset password, delete the admin and run this script again.');
      process.exit(0);
    }

    // Create new admin
    const admin = await Admin.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@drivesutrago.com',
      password: 'Admin@123', // Change this password after first login!
      role: 'super_admin',
      permissions: {
        verifyTrips: true,
        verifyTickets: true,
        manageUsers: true,
        manageRewards: true,
        viewAnalytics: true
      },
      isActive: true
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📧 Email: admin@drivesutrago.com');
    console.log('🔑 Password: Admin@123');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    console.log('\n🌐 Login at: http://localhost:5173/admin/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
