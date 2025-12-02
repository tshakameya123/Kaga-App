import mongoose from 'mongoose';

// OLD DATABASE (Render/production - where the 11 doctors and 38 patients are)
const OLD_URI = "mongodb+srv://myjoytrina20_db_user:CHdECSQJCGWeimyz@cluster0.mlixpaw.mongodb.net/kagaDB?appName=Cluster0";

// NEW DATABASE (your current dev database)
const NEW_URI = "mongodb+srv://myjoytrina20_db_user:UtM2x50eVuXKYHKK@cluster0.eb6egep.mongodb.net/santa?appName=Cluster0";

async function migrate() {
  console.log('=== MIGRATION SCRIPT ===\n');

  // Connect to OLD database
  console.log('1. Connecting to OLD database (kagaDB)...');
  const oldConn = await mongoose.createConnection(OLD_URI).asPromise();
  console.log('   Connected!\n');

  // Get data from old DB
  console.log('2. Fetching data from OLD database...');
  const oldDoctors = await oldConn.db.collection('doctors').find({}).toArray();
  const oldUsers = await oldConn.db.collection('users').find({}).toArray();
  const oldAppointments = await oldConn.db.collection('appointments').find({}).toArray();
  
  console.log(`   Found: ${oldDoctors.length} doctors, ${oldUsers.length} users, ${oldAppointments.length} appointments\n`);

  // Connect to NEW database
  console.log('3. Connecting to NEW database (santa)...');
  const newConn = await mongoose.createConnection(NEW_URI).asPromise();
  console.log('   Connected!\n');

  // Check existing data in new DB
  const existingDoctors = await newConn.db.collection('doctors').countDocuments();
  const existingUsers = await newConn.db.collection('users').countDocuments();
  
  console.log(`4. Current NEW database has: ${existingDoctors} doctors, ${existingUsers} users\n`);

  // Import doctors
  if (oldDoctors.length > 0) {
    console.log('5. Importing doctors...');
    // Clear existing doctors first to avoid duplicates
    await newConn.db.collection('doctors').deleteMany({});
    const doctorResult = await newConn.db.collection('doctors').insertMany(oldDoctors);
    console.log(`   Imported ${doctorResult.insertedCount} doctors!\n`);
  }

  // Import users (merge - skip existing emails)
  if (oldUsers.length > 0) {
    console.log('6. Importing users (skipping existing emails)...');
    let imported = 0;
    let skipped = 0;
    
    for (const user of oldUsers) {
      const exists = await newConn.db.collection('users').findOne({ email: user.email });
      if (!exists) {
        await newConn.db.collection('users').insertOne(user);
        imported++;
      } else {
        skipped++;
      }
    }
    console.log(`   Imported ${imported} users, skipped ${skipped} (already exist)\n`);
  }

  // Import appointments
  if (oldAppointments.length > 0) {
    console.log('7. Importing appointments...');
    await newConn.db.collection('appointments').deleteMany({});
    const aptResult = await newConn.db.collection('appointments').insertMany(oldAppointments);
    console.log(`   Imported ${aptResult.insertedCount} appointments!\n`);
  }

  // Verify
  console.log('8. Verifying migration...');
  const finalDoctors = await newConn.db.collection('doctors').countDocuments();
  const finalUsers = await newConn.db.collection('users').countDocuments();
  const finalAppointments = await newConn.db.collection('appointments').countDocuments();
  
  console.log(`   NEW database now has:`);
  console.log(`   - ${finalDoctors} doctors`);
  console.log(`   - ${finalUsers} users`);
  console.log(`   - ${finalAppointments} appointments\n`);

  // Close connections
  await oldConn.close();
  await newConn.close();
  
  console.log('=== MIGRATION COMPLETE ===');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
