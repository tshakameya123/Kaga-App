import axios from 'axios';
import 'dotenv/config';

const testRegistration = async () => {
  try {
    const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:4000';
    const testUser = {
      name: 'Test Registration User',
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123'
    };

    console.log('🧪 Testing User Registration API\n');
    console.log('📝 Test User Data:');
    console.log(`   Name: ${testUser.name}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: ${testUser.password}\n`);

    console.log(`📡 Sending request to: ${backendUrl}/api/user/register\n`);

    const response = await axios.post(`${backendUrl}/api/user/register`, testUser);

    if (response.data.success) {
      console.log('✅ Registration successful!');
      console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
      console.log(`\n💡 User should now be in the database.`);
      console.log(`   Run: npm run check-users\n`);
    } else {
      console.log('❌ Registration failed:');
      console.log(`   Message: ${response.data.message}\n`);
    }

    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
};

testRegistration();

