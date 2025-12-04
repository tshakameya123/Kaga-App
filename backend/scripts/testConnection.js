import mongoose from 'mongoose';
import 'dotenv/config';

const testConnection = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in .env file');
      console.error('💡 Please add your MongoDB connection string to backend/.env');
      process.exit(1);
    }

    console.log('🔌 Testing MongoDB Connection...\n');
    console.log('Connection String:', mongoURI.replace(/:[^:@]+@/, ':****@'));
    console.log('');

    // Connection options
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    // Connect to MongoDB
    await mongoose.connect(mongoURI, options);
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port || 'N/A (Atlas)'}`);
    
    // List collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`\n📁 Collections (${collections.length}):`);
    if (collections.length > 0) {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`   - ${collection.name}: ${count} documents`);
      }
    } else {
      console.log('   (No collections yet - database is empty)');
    }
    
    console.log('\n✅ Connection test successful!');
    console.log('💡 You can now start your server with: npm start\n');
    
    await mongoose.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('\n📝 Troubleshooting:');
    console.error('1. Check if MONGODB_URI is correct in your .env file');
    console.error('2. Verify your username and password are correct');
    console.error('3. Make sure your IP is whitelisted in MongoDB Atlas Network Access');
    console.error('4. Check your internet connection');
    console.error('5. Verify the cluster is running in MongoDB Atlas\n');
    process.exit(1);
  }
};

testConnection();

