import mongoose from 'mongoose';
import 'dotenv/config';
import userModel from '../models/userModel.js';

const findUserInAllDatabases = async () => {
  try {
    const baseURI = process.env.MONGODB_URI?.replace(/\/[^/]+(\?|$)/, '') || 
                   'mongodb+srv://myjoytrina20_db_user:UtM2x50eVuXKYHKK@cluster0.eb6egep.mongodb.net';
    
    const databases = ['santa', 'hospitaldb', 'kagaDB'];
    const testEmails = ['santa@gmail.com', 'ssssanta@gmail.com'];
    
    console.log('🔍 Searching for users across databases...\n');
    
    for (const dbName of databases) {
      try {
        const mongoURI = `${baseURI}/${dbName}?retryWrites=true&w=majority`;
        console.log(`📊 Checking database: ${dbName}`);
        
        // Connect to this database
        await mongoose.connect(mongoURI);
        const db = mongoose.connection.db;
        
        // Check if users collection exists
        const collections = await db.listCollections().toArray();
        const hasUsersCollection = collections.some(col => col.name === 'users');
        
        if (hasUsersCollection) {
          const users = await userModel.find({}).select('-password');
          console.log(`   👤 Found ${users.length} user(s)`);
          
          if (users.length > 0) {
            console.log(`   📋 Users in ${dbName}:`);
            users.forEach((user, idx) => {
              console.log(`      ${idx + 1}. ${user.name} (${user.email})`);
            });
          }
          
          // Check for specific emails
          for (const email of testEmails) {
            const user = await userModel.findOne({ email });
            if (user) {
              console.log(`   ✅ Found email "${email}" in ${dbName}!`);
              console.log(`      User ID: ${user._id}`);
              console.log(`      Name: ${user.name}`);
            }
          }
        } else {
          console.log(`   📭 No users collection found`);
        }
        
        await mongoose.disconnect();
        console.log('');
        
      } catch (error) {
        console.log(`   ❌ Error checking ${dbName}: ${error.message}\n`);
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
      }
    }
    
    console.log('✅ Search complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

findUserInAllDatabases();

