import mongoose from 'mongoose';

// Check all databases on the cluster
const CLUSTERS = [
  { name: "Cluster mlixpaw (old)", uri: "mongodb+srv://myjoytrina20_db_user:CHdECSQJCGWeimyz@cluster0.mlixpaw.mongodb.net/?appName=Cluster0" },
  { name: "Cluster eb6egep (new)", uri: "mongodb+srv://myjoytrina20_db_user:UtM2x50eVuXKYHKK@cluster0.eb6egep.mongodb.net/?appName=Cluster0" },
];

async function findData() {
  console.log('=== SEARCHING ALL DATABASES FOR DOCTORS ===\n');

  for (const cluster of CLUSTERS) {
    console.log(`\n📍 ${cluster.name}`);
    console.log('='.repeat(50));
    
    try {
      const conn = await mongoose.createConnection(cluster.uri).asPromise();
      
      // List all databases
      const adminDb = conn.db.admin();
      const dbs = await adminDb.listDatabases();
      
      for (const dbInfo of dbs.databases) {
        if (dbInfo.name === 'admin' || dbInfo.name === 'local') continue;
        
        const db = conn.db.client.db(dbInfo.name);
        const collections = await db.listCollections().toArray();
        
        console.log(`\n  Database: ${dbInfo.name}`);
        
        for (const col of collections) {
          const count = await db.collection(col.name).countDocuments();
          console.log(`    - ${col.name}: ${count} documents`);
          
          // Show sample if doctors or users
          if ((col.name === 'doctors' || col.name === 'users') && count > 0) {
            const sample = await db.collection(col.name).findOne({});
            console.log(`      Sample: ${sample.name || sample.email || 'N/A'}`);
          }
        }
      }
      
      await conn.close();
    } catch (err) {
      console.log(`  Error: ${err.message}`);
    }
  }
  
  console.log('\n=== SEARCH COMPLETE ===');
  process.exit(0);
}

findData().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
