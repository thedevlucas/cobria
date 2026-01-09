// Test Cost Tracking Endpoints
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testCostTracking() {
  console.log('🧪 Testing Cost Tracking endpoints...');
  
  try {
    // Test billing endpoints
    console.log('💰 Testing /api/billing/costs...');
    const costsResponse = await axios.get(`${API_URL}/api/billing/costs?period=30`);
    console.log('✅ Costs endpoint working:', costsResponse.data);
    
    console.log('📊 Testing /api/billing/summary...');
    const summaryResponse = await axios.get(`${API_URL}/api/billing/summary`);
    console.log('✅ Summary endpoint working:', summaryResponse.data);
    
    console.log('💳 Testing /api/billing/subscription...');
    const subscriptionResponse = await axios.get(`${API_URL}/api/billing/subscription`);
    console.log('✅ Subscription endpoint working:', subscriptionResponse.data);
    
    console.log('🎉 All Cost Tracking endpoints working!');
    
  } catch (error) {
    console.error('❌ Error testing Cost Tracking:', error.response?.data || error.message);
    console.log('💡 This is expected if the server needs to be restarted to load new routes');
  }
}

testCostTracking();


