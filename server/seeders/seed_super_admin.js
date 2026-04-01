const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });


const User = require('../models/User');

const seedSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Check if super admin already exists
    const existing = await User.findOne({ role: 'super_admin' });
    if (existing) {
      console.log('⚠️  Super admin already exists:', existing.email);
      process.exit(0);
    }

    // Create super admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', salt);

    await User.create({
      name: 'Super Admin',
      email: 'superadmin@relstone.com',
      password: hashedPassword,
      role: 'super_admin',
      isVerified: true,
      is_active: true,
    });

    console.log('✅ Super admin created!');
    console.log('📧 Email: superadmin@relstone.com');
    console.log('🔑 Password: SuperAdmin@123');
    console.log('⚠️  Please change the password after first login!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seeder error:', err.message);
    process.exit(1);
  }
};

seedSuperAdmin();