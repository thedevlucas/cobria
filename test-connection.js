// Test Backend Connection
const axios = require('axios');

async function testConnection() {
  try {
    console.log('🧪 Testing backend connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Test login endpoint (should return 400 for missing data, not connection error)
    try {
      await axios.post('http://localhost:3000/api/login');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Login endpoint responding (400 as expected for missing data)');
      } else {
        console.log('❌ Login endpoint error:', error.message);
      }
    }
    
    // Test billing endpoint (should return 401 for missing auth, not 404)
    try {
      await axios.get('http://localhost:3000/api/billing/costs');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Billing endpoint responding (401 as expected for missing auth)');
      } else if (error.response && error.response.status === 404) {
        console.log('❌ Billing endpoint not found (404)');
      } else {
        console.log('❌ Billing endpoint error:', error.message);
      }
    }
    
    console.log('🎉 Backend connection test completed!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();


