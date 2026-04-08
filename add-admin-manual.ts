import mongoose from 'mongoose';
import dbConnect from './app/lib/mongodb';
import User from './app/models/User';

async function addAdmin() {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Connected to database:', mongoose.connection.name);
    
    const email = 'admin@gmail.com';
    const password = '123456';
    
    console.log(`Checking if ${email} exists...`);
    const existing = await User.findOne({ email });
    
    if (existing) {
      console.log('User already exists. Updating password and status...');
      existing.password = password;
      existing.status = 'approved';
      existing.role = 'admin';
      await existing.save();
      console.log('User updated successfully.');
    } else {
      console.log('User not found. Creating new admin user...');
      await User.create({
        name: 'Admin',
        email,
        password,
        role: 'admin',
        status: 'approved'
      });
      console.log('Admin user created successfully.');
    }
    
    // Double check
    const check = await User.findOne({ email });
    console.log('Verification check - Found user:', check ? check.email : 'NOT FOUND');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding admin:', error);
    process.exit(1);
  }
}

addAdmin();
