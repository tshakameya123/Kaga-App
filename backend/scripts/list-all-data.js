import 'dotenv/config';
import mongoose from 'mongoose';

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in environment');
    process.exit(1);
  }

  console.log('Connecting to:', uri.replace(/:[^:@]+@/, ':****@'));

  try {
    await mongoose.connect(uri);
    console.log('Connected to DB\n');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('=== ALL COLLECTIONS IN DATABASE ===\n');
    
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`${col.name}: ${count} documents`);
    }

    console.log('\n=== DETAILED DATA ===\n');

    // Check doctors
    const doctors = await mongoose.connection.db.collection('doctors').find({}).toArray();
    console.log(`\nDOCTORS (${doctors.length}):`);
    doctors.forEach((doc, i) => {
      console.log(`  ${i + 1}. ${doc.name} - ${doc.speciality} (${doc.available ? 'Available' : 'Unavailable'})`);
    });

    // Check users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`\nUSERS/PATIENTS (${users.length}):`);
    users.forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.name} (${user.email})`);
    });

    // Check appointments
    const appointments = await mongoose.connection.db.collection('appointments').find({}).toArray();
    console.log(`\nAPPOINTMENTS (${appointments.length}):`);
    appointments.forEach((apt, i) => {
      console.log(`  ${i + 1}. ${apt.slotDate} ${apt.slotTime} - Cancelled: ${apt.cancelled || false}`);
    });

  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
