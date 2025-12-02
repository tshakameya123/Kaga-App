import mongoose from 'mongoose';
import 'dotenv/config';
import userModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';

const testUserCreation = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined');
      process.exit(1);
    }

    // Extract database name
    const dbNameMatch = mongoURI.match(/\/([^?]+)/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';
    
    console.log(`🔌 Connecting to database: ${dbName}`);
    console.log(`📡 URI: ${mongoURI.replace(/:[^:@]+@/, ':****@')}\n`);

    // Connect
    await mongoose.connect(mongoURI);
    console.log(`✅ Connected to: ${mongoose.connection.name}\n`);

    // Test user data
    const testEmail = 'test@example.com';
    const testName = 'Test User';
    const testPassword = 'testpassword123';

    // Check if user exists
    const existing = await userModel.findOne({ email: testEmail });
    if (existing) {
      console.log(`⚠️  User with email ${testEmail} already exists`);
      console.log(`   ID: ${existing._id}`);
      console.log(`   Name: ${existing.name}\n`);
    } else {
      console.log(`📝 Creating test user...`);
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);

      // Create user
      const newUser = new userModel({
        name: testName,
        email: testEmail,
        password: hashedPassword
      });

      const savedUser = await newUser.save();
      console.log(`✅ User created successfully!`);
      console.log(`   ID: ${savedUser._id}`);
      console.log(`   Name: ${savedUser.name}`);
      console.log(`   Email: ${savedUser.email}`);
      console.log(`   Database: ${mongoose.connection.name}\n`);
    }

    // List all users
    const allUsers = await userModel.find({}).select('-password');
    console.log(`📋 Total users in ${dbName}: ${allUsers.length}`);
    if (allUsers.length > 0) {
      allUsers.forEach((user, idx) => {
        console.log(`   ${idx + 1}. ${user.name} (${user.email})`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Test complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate key error - user already exists');
    }
    process.exit(1);
  }
};

testUserCreation();

