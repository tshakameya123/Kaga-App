import mongoose from 'mongoose';
import 'dotenv/config';
import userModel from '../models/userModel.js';

const listAllUsers = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined');
      process.exit(1);
    }

    // Extract database name
    const dbNameMatch = mongoURI.match(/\/([^?]+)/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';
    
    console.log('📊 Listing All Users in Database');
    console.log(`   Database: ${dbName}`);
    console.log(`   Connection: ${mongoURI.replace(/:[^:@]+@/, ':****@')}\n`);

    // Connect
    await mongoose.connect(mongoURI);
    console.log(`✅ Connected to: ${mongoose.connection.name}\n`);

    // Get all users (including password field for verification)
    const users = await userModel.find({}).sort({ _id: -1 }); // Sort by newest first
    
    if (users.length === 0) {
      console.log('📭 No users found in the database.\n');
    } else {
      console.log(`📋 Found ${users.length} user(s):\n`);
      console.log('═'.repeat(100));
      
      users.forEach((user, index) => {
        const createdAt = user._id.getTimestamp();
        const timeAgo = getTimeAgo(createdAt);
        
        console.log(`\n👤 User #${index + 1}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phone || 'Not set'}`);
        console.log(`   Gender: ${user.gender || 'Not set'}`);
        console.log(`   DOB: ${user.dob || 'Not set'}`);
        console.log(`   Created: ${createdAt.toLocaleString()} (${timeAgo})`);
        console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`);
        console.log(`   Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'N/A'}`);
        console.log('─'.repeat(100));
      });
      
      console.log(`\n✅ Total: ${users.length} user(s)\n`);
      
      // Show database info
      const db = mongoose.connection.db;
      const stats = await db.stats();
      console.log('📊 Database Statistics:');
      console.log(`   Collections: ${stats.collections}`);
      console.log(`   Data Size: ${(stats.dataSize / 1024).toFixed(2)} KB`);
      console.log(`   Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB\n`);
    }

    await mongoose.disconnect();
    console.log('✅ Done!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day(s) ago`;
  if (hours > 0) return `${hours} hour(s) ago`;
  if (minutes > 0) return `${minutes} minute(s) ago`;
  return `${seconds} second(s) ago`;
}

listAllUsers();

