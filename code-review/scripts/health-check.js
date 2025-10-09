#!/usr/bin/env node

/**
 * Health Check Script
 * This script checks the health of the deployed application.
 */

const https = require('https');
const http = require('http');
const url = require('url');

// Get the URL from environment variable or command line argument
const TARGET_URL = process.env.HEALTH_CHECK_URL || process.argv[2] || 'http://localhost:9002';

async function healthCheck() {
  console.log(`🏥 Checking health of ${TARGET_URL}...\n`);
  
  try {
    const healthEndpoint = `${TARGET_URL}/api/health`;
    const parsedUrl = url.parse(healthEndpoint);
    
    const response = await new Promise((resolve, reject) => {
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      
      protocol.get(healthEndpoint, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
    
    if (response.statusCode === 200) {
      const healthData = JSON.parse(response.data);
      console.log('✅ Health check passed!');
      console.log(`Status: ${healthData.status}`);
      console.log(`Message: ${healthData.message}`);
      console.log(`Timestamp: ${healthData.timestamp}`);
      return true;
    } else {
      console.error(`❌ Health check failed with status ${response.statusCode}`);
      console.error(`Response: ${response.data}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Health check failed with error:');
    console.error(error.message);
    return false;
  }
}

// Run the health check
healthCheck().then((success) => {
  process.exit(success ? 0 : 1);
});