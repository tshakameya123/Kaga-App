import mongoose from 'mongoose';
import 'dotenv/config';
import doctorModel from '../models/doctorModel.js';
import userModel from '../models/userModel.js';
import appointmentModel from '../models/AppointmentModel.js';
import messageModel from '../models/messageModel.js';

const migrateToKagaDB = async () => {
  try {
    // Source database (hospitaldb)
    const sourceURI = process.env.MONGODB_URI?.replace(/\/[^/]+$/, '/hospitaldb') || 
                     'mongodb+srv://macstack538:verticgalleons@cluster0.fd83o.mongodb.net/hospitaldb';
    
    // Target database (kagaDB)
    const targetURI = process.env.MONGODB_URI?.replace(/\/[^/]+$/, '/kagaDB') || 
                     'mongodb+srv://macstack538:verticgalleons@cluster0.fd83o.mongodb.net/kagaDB';

    console.log('🔄 Starting Migration from hospitaldb to kagaDB\n');
    console.log('📥 Source:', sourceURI.replace(/:[^:@]+@/, ':****@'));
    console.log('📤 Target:', targetURI.replace(/:[^:@]+@/, ':****@'));
    console.log('');

    // Connect to source database
    await mongoose.connect(sourceURI);
    console.log('✅ Connected to source database (hospitaldb)\n');

    // Get all data from source
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});
    const messages = await messageModel.find({});

    console.log(`📊 Found in source database:`);
    console.log(`   👨‍⚕️  Doctors: ${doctors.length}`);
    console.log(`   👤 Users: ${users.length}`);
    console.log(`   📅 Appointments: ${appointments.length}`);
    console.log(`   💬 Messages: ${messages.length}\n`);

    // Disconnect from source
    await mongoose.disconnect();

    // Connect to target database
    await mongoose.connect(targetURI);
    console.log('✅ Connected to target database (kagaDB)\n');

    // Migrate doctors
    if (doctors.length > 0) {
      // Remove _id to allow MongoDB to create new ones
      const doctorsToInsert = doctors.map(doc => {
        const docObj = doc.toObject();
        delete docObj._id;
        return docObj;
      });
      await doctorModel.insertMany(doctorsToInsert);
      console.log(`✅ Migrated ${doctors.length} doctors`);
    }

    // Migrate users
    if (users.length > 0) {
      const usersToInsert = users.map(user => {
        const userObj = user.toObject();
        delete userObj._id;
        return userObj;
      });
      await userModel.insertMany(usersToInsert);
      console.log(`✅ Migrated ${users.length} users`);
    }

    // Migrate appointments
    if (appointments.length > 0) {
      const appointmentsToInsert = appointments.map(apt => {
        const aptObj = apt.toObject();
        delete aptObj._id;
        return aptObj;
      });
      await appointmentModel.insertMany(appointmentsToInsert);
      console.log(`✅ Migrated ${appointments.length} appointments`);
    }

    // Migrate messages
    if (messages.length > 0) {
      const messagesToInsert = messages.map(msg => {
        const msgObj = msg.toObject();
        delete msgObj._id;
        return msgObj;
      });
      await messageModel.insertMany(messagesToInsert);
      console.log(`✅ Migrated ${messages.length} messages`);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('💡 Update your .env file to use kagaDB as the database name\n');

    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.code === 11000) {
      console.error('⚠️  Some documents already exist in target database (duplicate key error)');
    }
    process.exit(1);
  }
};

migrateToKagaDB();

