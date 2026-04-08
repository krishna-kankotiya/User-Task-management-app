import mongoose from 'mongoose';
import dbConnect from './app/lib/mongodb';

async function findDb() {
  try {
    const baseUri = 'mongodb+srv://krishna:krishna2121@cluster0.xsxwwrj.mongodb.net';
    
    const dbs = [
      'admin', 'chatapp', 'config', 'dashboard', 'fileUploadDB', 
      'linkedDB', 'local', 'myapp', 'newtest', 'nextjs', 
      'pagination', 'performance', 'pitchdeck-pro', 'profile', 
      'rbacDB', 'skillswap', 'socketChat', 'student', 'task', 
      'test', 'timeCapsule', 'todo', 'todo-app', 'websocket_chat', 
      'zodBackend'
    ];
    
    for (const dbName of dbs) {
      if (['admin', 'config', 'local'].includes(dbName)) continue;
      
      const uri = `${baseUri}/${dbName}?appName=Cluster0`;
      console.log(`Checking DB: ${dbName}...`);
      
      try {
        const conn = await mongoose.createConnection(uri).asPromise();
        const User = conn.model('User', new mongoose.Schema({ email: String }), 'users');
        
        const user = await User.findOne({ email: 'atlas@gmail.com' });
        if (user) {
          console.log(`FOUND IT! Database "${dbName}" contains atlas@gmail.com`);
          await conn.close();
          process.exit(0);
        }
        await conn.close();
      } catch (err) {
        console.log(`Skipping DB ${dbName} due to error or missing collection.`);
      }
    }
    
    console.log('Finished checking all databases. No match for atlas@gmail.com');
    process.exit(1);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findDb();
