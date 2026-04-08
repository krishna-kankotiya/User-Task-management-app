import dbConnect from './app/lib/mongodb';
import User from './app/models/User';
import bcrypt from 'bcryptjs';

async function checkPass() {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    
    const user = await User.findOne({ email: 'admin@gmail.com' });
    
    if (user) {
      console.log('User found:', user.email);
      const isMatch = await bcrypt.compare('123456', user.password);
      console.log('Password match for "123456":', isMatch);
    } else {
      console.log('User not found.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPass();
