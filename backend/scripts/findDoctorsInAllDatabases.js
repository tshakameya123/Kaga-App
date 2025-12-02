import mongoose from 'mongoose';
import 'dotenv/config';
import doctorModel from '../models/doctorModel.js';

const findDoctorsInAllDatabases = async () => {
  try {
    const baseURI = process.env.MONGODB_URI?.replace(/\/[^/]+(\?|$)/, '') || 
                   'mongodb+srv://myjoytrina20_db_user:UtM2x50eVuXKYHKK@cluster0.eb6egep.mongodb.net';
    
    const databases = ['santa', 'hospitaldb', 'kagaDB'];
    
    console.log('🔍 Searching for doctors across all databases...\n');
    
    let totalDoctors = 0;
    
    for (const dbName of databases) {
      try {
        const mongoURI = `${baseURI}/${dbName}?retryWrites=true&w=majority`;
        console.log(`📊 Checking database: ${dbName}`);
        
        // Connect to this database
        await mongoose.connect(mongoURI);
        const db = mongoose.connection.db;
        
        // Check if doctors collection exists
        const collections = await db.listCollections().toArray();
        const hasDoctorsCollection = collections.some(col => col.name === 'doctors');
        
        if (hasDoctorsCollection) {
          const doctors = await doctorModel.find({}).select('-password -email');
          console.log(`   👨‍⚕️  Found ${doctors.length} doctor(s)`);
          
          if (doctors.length > 0) {
            console.log(`   📋 Doctors in ${dbName}:`);
            doctors.forEach((doctor, idx) => {
              console.log(`      ${idx + 1}. ${doctor.name} - ${doctor.speciality} (${doctor.available ? 'Available' : 'Not Available'})`);
            });
            totalDoctors += doctors.length;
          }
        } else {
          console.log(`   📭 No doctors collection found`);
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
    
    console.log(`\n✅ Search complete!`);
    console.log(`📊 Total doctors found across all databases: ${totalDoctors}`);
    
    if (totalDoctors === 0) {
      console.log('\n💡 No doctors found in any database.');
      console.log('   You need to add doctors through the admin panel.');
    } else {
      console.log('\n💡 If doctors are in a different database, you may need to:');
      console.log('   1. Update your .env file to point to that database, OR');
      console.log('   2. Migrate the doctors to the santa database');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

findDoctorsInAllDatabases();

