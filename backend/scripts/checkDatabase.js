import mongoose from 'mongoose';
import 'dotenv/config';
import doctorModel from '../models/doctorModel.js';
import userModel from '../models/userModel.js';
import appointmentModel from '../models/AppointmentModel.js';
import messageModel from '../models/messageModel.js';

const checkDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined');
      process.exit(1);
    }

    // Extract database name from URI
    const dbNameMatch = mongoURI.match(/\/([^?]+)/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';
    
    console.log('📊 Database Information:');
    console.log(`   Database Name: ${dbName}`);
    console.log(`   Connection URI: ${mongoURI.replace(/:[^:@]+@/, ':****@')}\n`);

    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📁 Collections in database:');
    console.log('─'.repeat(60));
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   ${collection.name}: ${count} documents`);
    }
    
    console.log('─'.repeat(60));
    
    // Get detailed counts
    const doctorsCount = await doctorModel.countDocuments();
    const usersCount = await userModel.countDocuments();
    const appointmentsCount = await appointmentModel.countDocuments();
    const messagesCount = await messageModel.countDocuments();
    
    console.log('\n📈 Detailed Statistics:');
    console.log(`   👨‍⚕️  Doctors: ${doctorsCount}`);
    console.log(`   👤 Users: ${usersCount}`);
    console.log(`   📅 Appointments: ${appointmentsCount}`);
    console.log(`   💬 Messages: ${messagesCount}`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkDatabase();

