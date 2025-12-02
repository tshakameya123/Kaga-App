import axios from 'axios';
import 'dotenv/config';

const testDoctorAPI = async () => {
  try {
    const backendUrl = process.env.VITE_BACKEND_URL || 'http://localhost:4000';
    
    console.log('🧪 Testing Doctor List API\n');
    console.log(`📡 Requesting: ${backendUrl}/api/doctor/list\n`);

    const response = await axios.get(`${backendUrl}/api/doctor/list`);

    if (response.data.success) {
      console.log(`✅ API Response: Success`);
      console.log(`📊 Doctors returned: ${response.data.doctors.length}\n`);
      
      if (response.data.doctors.length > 0) {
        console.log('👨‍⚕️  Doctors from API:');
        response.data.doctors.forEach((doctor, idx) => {
          console.log(`   ${idx + 1}. ${doctor.name} - ${doctor.speciality} (ID: ${doctor._id})`);
        });
        console.log('\n⚠️  Doctors are being returned by the API!');
        console.log('   But they are not in the santa database.');
        console.log('   This means the API might be connecting to a different database.');
      } else {
        console.log('📭 No doctors returned by API');
      }
    } else {
      console.log('❌ API Response: Failed');
      console.log(`   Message: ${response.data.message}\n`);
    }

    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure your backend server is running on port 4000');
    }
    process.exit(1);
  }
};

testDoctorAPI();

