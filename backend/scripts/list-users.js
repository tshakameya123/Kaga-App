import 'dotenv/config';
import mongoose from 'mongoose';
import userModel from '../models/userModel.js';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in environment');
    process.exit(1);
  }

  console.log('Connecting to:', uri.replace(/:[^:@]+@/, ':****@')); // hide password

  try {
    await mongoose.connect(uri);
    console.log('Connected to DB\n');

    const users = await userModel.find({}).select('-password');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`Found ${users.length} user(s):\n`);
      users.forEach((user, i) => {
        console.log(`${i + 1}. ${user.name} (${user.email})`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Image: ${user.image ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
