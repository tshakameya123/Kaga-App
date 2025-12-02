import mongoose from 'mongoose';
import 'dotenv/config';
import doctorModel from '../models/doctorModel.js';

const listDoctors = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get all doctors
    const doctors = await doctorModel.find({}).select('-password -email');
    
    if (doctors.length === 0) {
      console.log('📭 No doctors found in the database.');
      console.log('💡 You can add doctors through the admin panel at http://localhost:5174/add-doctor\n');
    } else {
      console.log(`📋 Found ${doctors.length} doctor(s) in the database:\n`);
      console.log('═'.repeat(80));
      
      doctors.forEach((doctor, index) => {
        console.log(`\n👨‍⚕️ Doctor #${index + 1}`);
        console.log(`   ID: ${doctor._id}`);
        console.log(`   Name: ${doctor.name}`);
        console.log(`   Speciality: ${doctor.speciality}`);
        console.log(`   Degree: ${doctor.degree}`);
        console.log(`   Experience: ${doctor.experience} years`);
        console.log(`   Fees: ${doctor.fees}`);
        console.log(`   Available: ${doctor.available ? '✅ Yes' : '❌ No'}`);
        console.log(`   Image: ${doctor.image}`);
        console.log(`   About: ${doctor.about?.substring(0, 100)}${doctor.about?.length > 100 ? '...' : ''}`);
        if (doctor.address) {
          console.log(`   Address: ${doctor.address.line1 || 'N/A'}, ${doctor.address.line2 || 'N/A'}`);
        }
        console.log(`   Date Added: ${new Date(doctor.date).toLocaleString()}`);
        console.log('─'.repeat(80));
      });
      
      console.log(`\n✅ Total: ${doctors.length} doctor(s)\n`);
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

listDoctors();

