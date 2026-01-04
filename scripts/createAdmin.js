/**
 * Script to create an admin user
 * Usage: node scripts/createAdmin.js <email> <name>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { connectDB } = require('../config/db');

const createAdmin = async () => {
  try {
    await connectDB();

    const email = process.argv[2];
    const name = process.argv[3] || 'Admin';
    const password = process.argv[4];

    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Usage: node scripts/createAdmin.js <email> <name> [password]');
      console.log('Example: node scripts/createAdmin.js admin@example.com "Admin User" mySecurePassword123');
      process.exit(1);
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      console.warn('⚠️  No password provided. Admin will need to set password later or use OTP.');
    }

    if (user) {
      // Update existing user to admin
      user.role = 'admin';
      user.isVerified = true;
      if (hashedPassword) {
        user.password = hashedPassword;
      }
      await user.save();
      console.log(`✅ User ${email} has been updated to admin role`);
    } else {
      // Create new admin user
      user = await User.create({
        name,
        email,
        role: 'admin',
        isVerified: true,
        password: hashedPassword
      });
      console.log(`✅ Admin user created: ${email}`);
    }

    console.log(`\nAdmin Details:`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    if (hashedPassword) {
      console.log(`  Password: Set (hashed)`);
      console.log(`\n✅ Admin can now login with email and password`);
    } else {
      console.log(`  Password: Not set`);
      console.log(`\n⚠️  Admin will need to login via OTP or set password later`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

