import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { name, email, password, role, position } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 400 }
      );
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      position: position || 'Frontend',
      status: 'pending', // All self-registrations require approval
    });

    // Don't return token - user needs admin approval first
    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      message: 'Registration successful. Your account is pending admin approval.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
