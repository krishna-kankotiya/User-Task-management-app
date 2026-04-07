import dbConnect from '../app/lib/mongodb';
import User from '../app/models/User';

async function seedAdmin() {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Updating...');
      existingAdmin.name = 'Admin';
      existingAdmin.password = '123456';
      existingAdmin.role = 'admin';
      existingAdmin.status = 'approved';
      await existingAdmin.save();
      console.log('Admin updated successfully');
      process.exit(0);
    }
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: '123456',
      role: 'admin',
      status: 'approved',
    });
    
    console.log('Admin user created successfully:', {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      status: admin.status,
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
