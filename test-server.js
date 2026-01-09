#!/usr/bin/env node

/**
 * Comprehensive Server Test Script
 * Tests all endpoints and provides detailed diagnostics
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3001';
const TIMEOUT = 10000;

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: TIMEOUT
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody,
            success: res.statusCode >= 200 && res.statusCode < 400
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
            success: res.statusCode >= 200 && res.statusCode < 400
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testEndpoint(name, path, method = 'GET', data = null) {
  try {
    console.log(`🧪 Testing ${name}...`);
    const result = await makeRequest(path, method, data);
    
    if (result.success) {
      console.log(`✅ ${name}: ${result.status} - ${JSON.stringify(result.body).substring(0, 100)}...`);
    } else {
      console.log(`❌ ${name}: ${result.status} - ${result.body}`);
    }
    
    return result;
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runComprehensiveTest() {
  console.log('🔍 COBRIA Backend Comprehensive Test');
  console.log('====================================\n');
  
  const tests = [
    { name: 'Root Endpoint', path: '/', method: 'GET' },
    { name: 'Health Check', path: '/health', method: 'GET' },
    { name: 'Register Endpoint', path: '/api/register', method: 'POST', data: { test: true } },
    { name: 'Login Endpoint', path: '/api/login', method: 'POST', data: { test: true } },
    { name: 'Admin Endpoint', path: '/api/admin', method: 'GET' },
    { name: 'User Endpoint', path: '/api/user', method: 'GET' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.name, test.path, test.method, test.data);
    results.push({ ...test, result });
    console.log(''); // Empty line for readability
  }
  
  // Summary
  console.log('📊 Test Summary');
  console.log('===============');
  
  const successful = results.filter(r => r.result.success).length;
  const total = results.length;
  
  results.forEach(test => {
    const status = test.result.success ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.result.status || 'ERROR'}`);
  });
  
  console.log(`\n🎯 Overall: ${successful}/${total} tests passed`);
  
  if (successful === total) {
    console.log('🎉 All endpoints are working correctly!');
  } else if (successful > 0) {
    console.log('⚠️  Some endpoints are working, but others need attention.');
  } else {
    console.log('❌ Server appears to be down or not responding.');
    console.log('💡 Make sure the server is running with: npm run dev');
  }
  
  return results;
}

// Run the test
runComprehensiveTest().catch(console.error);
