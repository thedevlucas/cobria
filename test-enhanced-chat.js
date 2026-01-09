// Test Enhanced Chat Endpoints
const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testEnhancedChat() {
  console.log('🧪 Testing Enhanced Chat endpoints...');
  
  try {
    // Test statistics endpoint
    console.log('📊 Testing /api/enhanced-chat/statistics...');
    const statsResponse = await axios.get(`${API_URL}/api/enhanced-chat/statistics`);
    console.log('✅ Statistics endpoint working:', statsResponse.data);
    
    // Test conversations endpoint
    console.log('💬 Testing /api/enhanced-chat/conversations...');
    const conversationsResponse = await axios.get(`${API_URL}/api/enhanced-chat/conversations`);
    console.log('✅ Conversations endpoint working:', conversationsResponse.data);
    
    // Test chats endpoint
    console.log('📱 Testing /api/enhanced-chat/chats...');
    const chatsResponse = await axios.get(`${API_URL}/api/enhanced-chat/chats`);
    console.log('✅ Chats endpoint working:', chatsResponse.data);
    
    console.log('🎉 All Enhanced Chat endpoints working!');
    
  } catch (error) {
    console.error('❌ Error testing Enhanced Chat:', error.response?.data || error.message);
  }
}

testEnhancedChat();