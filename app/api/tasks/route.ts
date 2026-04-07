import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Task from '@/app/models/Task';
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

    let tasks;
    if (currentUser.role === 'admin') {
      tasks = await Task.find({})
        .populate('assignedTo', 'name email')
        .populate('assignedBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ assignedTo: userId })
        .populate('assignedTo', 'name email')
        .populate('assignedBy', 'name email')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to get tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    if (currentUser.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { title, description, assignedTo, priority, dueDate } = await request.json();

    if (!title || !description || !assignedTo) {
      return NextResponse.json({ message: 'Please provide all required fields' }, { status: 400 });
    }

    // assignedTo can be a single ID or an array of IDs
    const assignees = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

    // Validate all assignees exist
    const usersCount = await User.countDocuments({ _id: { $in: assignees } });
    if (usersCount !== assignees.length) {
      return NextResponse.json({ message: 'One or more assigned users not found' }, { status: 404 });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: assignees,
      assignedBy: userId,
      priority: priority || 'medium',
      dueDate: dueDate || null,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    return NextResponse.json(populatedTask, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    const { taskId, status } = await request.json();
    if (!taskId || !status) {
      return NextResponse.json({ message: 'Missing task ID or status' }, { status: 400 });
    }

    const userId = decoded.userId;
    const task = await Task.findById(taskId);

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    // Only assigned users or admin can update status
    const isAssigned = task.assignedTo.some((id: any) => id.toString() === userId);
    const isAdmin = decoded.role === 'admin';

    if (!isAssigned && !isAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    return NextResponse.json(updatedTask);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}
