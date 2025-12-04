import mongoose from 'mongoose';
import 'dotenv/config';
import userModel from '../models/userModel.js';

const checkUsers = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined');
      process.exit(1);
    }

    // Extract database name from URI
    const dbNameMatch = mongoURI.match(/\/([^?]+)/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';
    
    console.log('📊 Checking Users in Database:');
    console.log(`   Database: ${dbName}\n`);

    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get all users
    const users = await userModel.find({}).select('-password');
    
    if (users.length === 0) {
      console.log('📭 No users found in the database.\n');
    } else {
      console.log(`📋 Found ${users.length} user(s):\n`);
      console.log('═'.repeat(80));
      
      users.forEach((user, index) => {
        console.log(`\n👤 User #${index + 1}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phone || 'Not set'}`);
        console.log(`   Gender: ${user.gender || 'Not set'}`);
        console.log(`   Date Created: ${user._id.getTimestamp().toLocaleString()}`);
        console.log('─'.repeat(80));
      });
      
      console.log(`\n✅ Total: ${users.length} user(s)\n`);
    }

    // Check for specific email
    const testEmail = 'santa@gmail.com';
    const existingUser = await userModel.findOne({ email: testEmail });
    if (existingUser) {
      console.log(`⚠️  Email "${testEmail}" already exists in database!`);
      console.log(`   User ID: ${existingUser._id}`);
      console.log(`   Name: ${existingUser.name}\n`);
    } else {
      console.log(`✅ Email "${testEmail}" is available for registration\n`);
    }

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkUsers();

