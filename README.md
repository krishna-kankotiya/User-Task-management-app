# TaskFlow - Task Management System

A modern task management platform with Admin and User roles, built with Next.js, MongoDB, and Tailwind CSS.

## Features

### Admin Features
- **Dashboard Overview** - View total members, pending approvals, task stats, completion rate
- **User Management** - View all users, approve pending accounts, reject/revoke access
- **Task Creation** - Create tasks with title, description, due date
- **Task Assignment** - Assign tasks to one or multiple team members
- **Team Analytics** - Track active, late, and completed tasks

### User Features
- **Register** - Create account with role (Frontend/Backend/Designer/Fullstack)
- **Approval Wait** - Account stays "pending" until admin approves
- **Personal Dashboard** - View assigned tasks with completion statistics
- **Task Management** - Mark tasks as completed/pending
- **Late Alerts** - Visual indicators for overdue tasks
- **Task History** - View completed tasks

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Default Admin Credentials

To create admin user (if not exists):
```bash
npm run seed
```

## Usage

### Admin Login
1. Go to `/login`
2. Enter: 'user details'
3. Redirected to Dashboard

### User Flow
1. Register at `/register`
2. Wait for admin approval
3. Login after approval
4. View and complete tasks on dashboard

### Admin Flow
1. View pending user requests
2. Approve/reject users
3. Create and assign tasks
4. Monitor team progress

## Project Structure

```
next-task-main/
├── app/
│   ├── (auth)/           # Login, Register pages
│   ├── admin/             # Admin dashboard, user & task management
│   ├── dashboard/        # User dashboard
│   ├── api/              # API routes (auth, tasks, admin)
│   ├── components/       # Reusable components
│   ├── models/           # MongoDB models (User, Task)
│   ├── services/        # Frontend service functions
│   └── lib/             # Utilities (MongoDB connection)
├── scripts/
│   └── seed-admin.ts     # Admin seed script
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Admin
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/[id]/status` - Update user status

### Tasks
- `GET /api/tasks` - Get tasks
- `POST /api/tasks` - Create task (admin only)
- `PATCH /api/tasks/[id]` - Update task status
- `DELETE /api/tasks/[id]` - Delete task (admin only)