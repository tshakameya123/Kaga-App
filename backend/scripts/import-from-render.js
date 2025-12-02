import mongoose from 'mongoose';
import https from 'https';

const NEW_URI = "mongodb+srv://myjoytrina20_db_user:UtM2x50eVuXKYHKK@cluster0.eb6egep.mongodb.net/santa?appName=Cluster0";
const RENDER_API = "https://kaga-health-backend.onrender.com/api";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } 
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function importFromRender() {
  console.log('=== IMPORTING DATA FROM RENDER BACKEND ===\n');

  // Fetch doctors
  console.log('1. Fetching doctors from Render API...');
  const doctorsResponse = await fetchJson(`${RENDER_API}/doctor/list`);
  const doctors = doctorsResponse.doctors || [];
  console.log(`   Found ${doctors.length} doctors\n`);

  // Connect
  console.log('2. Connecting to santa database...');
  await mongoose.connect(NEW_URI);
  console.log('   Connected!\n');

  // Drop the doctors collection entirely to remove bad indexes
  console.log('3. Dropping doctors collection...');
  try {
    await mongoose.connection.db.collection('doctors').drop();
    console.log('   Dropped!\n');
  } catch (e) {
    console.log('   Collection did not exist, continuing...\n');
  }

  // Import doctors one by one
  console.log('4. Importing doctors...');
  let imported = 0;
  for (const doc of doctors) {
    try {
      const docToInsert = {
        ...doc,
        _id: new mongoose.Types.ObjectId(doc._id)
      };
      await mongoose.connection.db.collection('doctors').insertOne(docToInsert);
      console.log(`   ✅ ${doc.name}`);
      imported++;
    } catch (e) {
      console.log(`   ❌ ${doc.name}: ${e.message}`);
    }
  }
  console.log(`\n   Imported ${imported}/${doctors.length} doctors\n`);

  // Verify
  console.log('5. Final database state:');
  const doctorCount = await mongoose.connection.db.collection('doctors').countDocuments();
  const userCount = await mongoose.connection.db.collection('users').countDocuments();
  console.log(`   - Doctors: ${doctorCount}`);
  console.log(`   - Users: ${userCount}`);

  await mongoose.disconnect();
  console.log('\n=== IMPORT COMPLETE ===');
  process.exit(0);
}

importFromRender().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
