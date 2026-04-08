import mongoose from 'mongoose';
import dbConnect from './app/lib/mongodb';

async function listAll() {
  try {
    console.log('Connecting...');
    await dbConnect();
    const admin = mongoose.connection.db?.admin();
    const result = await admin?.listDatabases();
    console.log('Connected to:', mongoose.connection.name);
    console.log('Databases available:', result?.databases.map((db: any) => db.name));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listAll();
