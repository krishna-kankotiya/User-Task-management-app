import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log(`Login attempt for: ${email}`);
    
    await dbConnect();
    const mongoose = (await import('mongoose')).default;
    console.log('DB connected successfully to:', mongoose.connection.name);
    const uri = process.env.MONGODB_URI || 'UNDEFINED';
    console.log('Using URI (masked):', uri.replace(/:([^@]+)@/, ':****@'));

    if (!email || !password) {
      return NextResponse.json({ message: 'Please provide email and password' }, { status: 400 });
    }

    console.log(`Searching for user with email: [${email}]`);
    let user = await User.findOne({ email });
    
    // Auto-create admin if it's the specific admin email and it's missing
    if (!user && email === 'admin@gmail.com') {
      console.log('Admin user missing in this database. Auto-creating [admin@gmail.com]...');
      try {
        user = await User.create({
          name: 'Admin',
          email: 'admin@gmail.com',
          password: '123456',
          role: 'admin',
          status: 'approved'
        });
        console.log('Admin user auto-created successfully.');
      } catch (createError) {
        console.error('Failed to auto-create admin:', createError);
      }
    }

    if (!user) {
      console.log(`User not found for email: [${email}]`);
      const allUsers = await User.find({}, 'email');
      console.log('Available users in DB:', allUsers.map((u: any) => u.email));
      return NextResponse.json({ message: `DEBUG: User not found in database. Search for [${email}] failed. We tried to find it in the [${mongoose.connection.name}] database.` }, { status: 401 });
    }

    console.log(`User found: ${user.email}, role: ${user.role}, status: ${user.status}`);
    console.log(`Comparing password for: ${email}`);
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log(`Password mismatch for: ${email}`);
      return NextResponse.json({ message: 'DEBUG: Password mismatch' }, { status: 401 });
    }

    // Check user status
    if (user.status === 'pending') {
      return NextResponse.json(
        { message: 'Your account is pending approval. Please wait for admin approval.' },
        { status: 403 }
      );
    }

    if (user.status === 'rejected') {
      return NextResponse.json(
        { message: 'Your account has been rejected. Please contact admin.' },
        { status: 403 }
      );
    }

    console.log(`Login successful for: ${email}, redirecting...`);
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token,
    });
  } catch (error: any) {
    console.error('Login error detail:', error);
    return NextResponse.json({ message: error.message || 'Login failed' }, { status: 500 });
  }
}
