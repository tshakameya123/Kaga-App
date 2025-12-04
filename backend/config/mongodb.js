import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Disconnect any existing connections first
    if (mongoose.connection.readyState !== 0) {
      console.log('🔄 Disconnecting existing MongoDB connection...');
      await mongoose.disconnect();
    }

    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      console.error('Please create a .env file in the backend directory with:');
      console.error('MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/santa?retryWrites=true&w=majority');
      process.exit(1);
    }

    // Extract database name from URI for logging
    const dbNameMatch = mongoURI.match(/\/([^?]+)/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';
    
    console.log(`🔌 Connecting to database: ${dbName}`);
    console.log(`📡 Connection string: ${mongoURI.replace(/:[^:@]+@/, ':****@')}`);

    // Connection options for better error handling
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,
    };

    // Event listeners
    mongoose.connection.on('connected', () => {
      console.log('✅ Database Connected to MongoDB');
      console.log(`📊 Database: ${mongoose.connection.name}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    // Connect to MongoDB
    await mongoose.connect(mongoURI, options);
    console.log(`✅ Successfully connected to MongoDB database: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.error('\n📝 Troubleshooting:');
    console.error('1. Check if MONGODB_URI is correct in your .env file');
    console.error('2. For MongoDB Atlas: Ensure your IP is whitelisted (0.0.0.0/0 for all IPs)');
    console.error('3. Verify your username and password are correct');
    console.error('4. Check your internet connection');
    process.exit(1);
  }
};

export default connectDB;