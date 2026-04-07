import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/User';
import { verifyToken } from '@/app/lib/auth';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const users = await User.find({}).select('-password');
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to get users' },
      { status: 500 }
    );
  }
}
