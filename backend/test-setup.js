const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:8080';

// Simple HTTP GET function
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Test endpoints
async function runTests() {
  console.log('🚀 Testing E-commerce Backend Setup...');
  console.log('=================================================\n');

  const tests = [
    { name: '1. Health Check', url: `${BASE_URL}/api/test/health` },
    { name: '2. Database Connection', url: `${BASE_URL}/api/test/db` },
    { name: '3. Environment Variables', url: `${BASE_URL}/api/test/env` },
    { name: '4. Available Routes', url: `${BASE_URL}/api/test/routes` },
    { name: '5. System Status', url: `${BASE_URL}/api/test/status` },
    { name: '6. Root Endpoint', url: `${BASE_URL}/` }
  ];

  for (const test of tests) {
    try {
      console.log(`${test.name}...`);
      const response = await makeRequest(test.url);
      
      console.log(`Status: ${response.status}`);
      if (typeof response.data === 'object') {
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log(response.data);
      }
      console.log('---\n');
      
    } catch (error) {
      console.error(`❌ ${test.name} failed:`, error.message);
      console.log('---\n');
    }
  }

  console.log('✅ Backend setup test completed!');
  console.log('If all tests show successful responses, your backend is properly configured.');
}

runTests().catch(console.error);
