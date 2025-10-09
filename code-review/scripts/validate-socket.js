#!/usr/bin/env node

/**
 * Socket Connection Validation Script
 * This script validates that socket connections are properly configured
 * and can be established to prevent runtime errors.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

console.log('🔍 Validating socket implementation...\n');

let hasErrors = false;

// Check if socket.io-client is installed
console.log('🔌 Checking socket.io-client dependency...');
try {
  require('socket.io-client');
  console.log('✅ socket.io-client is installed');
} catch (err) {
  console.error('❌ socket.io-client is not installed');
  hasErrors = true;
}

// Check if socket.io is installed
console.log('\n🔌 Checking socket.io dependency...');
try {
  require('socket.io');
  console.log('✅ socket.io is installed');
} catch (err) {
  console.error('❌ socket.io is not installed');
  hasErrors = true;
}

// Check for socket.io API routes
console.log('\n📁 Checking socket.io API routes...');
const socketIoRoutePath = path.join(SRC_DIR, 'app', 'api', 'socket_io', 'route.ts');
if (!fs.existsSync(socketIoRoutePath)) {
  console.error('❌ Missing socket.io API route: src/app/api/socket_io/route.ts');
  hasErrors = true;
} else {
  console.log('✅ Found socket.io API route');
  
  // Check route content
  const routeContent = fs.readFileSync(socketIoRoutePath, 'utf8');
  if (!routeContent.includes('GET') || !routeContent.includes('export async function GET')) {
    console.error('❌ Socket.io API route must export a GET function');
    hasErrors = true;
  }
  
  if (!routeContent.includes('/api/socket_io')) {
    console.error('❌ Socket.io API route should handle /api/socket_io path');
    hasErrors = true;
  }
}

// Check for socket connection in classroom component
console.log('\n🔍 Checking classroom component socket usage...');
const classroomComponentPath = path.join(SRC_DIR, 'components', 'classroom', 'classroom-home.tsx');
if (!fs.existsSync(classroomComponentPath)) {
  console.error('❌ Missing classroom component: src/components/classroom/classroom-home.tsx');
  hasErrors = true;
} else {
  console.log('✅ Found classroom component');
  
  const componentContent = fs.readFileSync(classroomComponentPath, 'utf8');
  if (!componentContent.includes('socket.io-client')) {
    console.error('❌ Classroom component should import socket.io-client');
    hasErrors = true;
  }
  
  if (!componentContent.includes('new SocketHealthMonitor') && !componentContent.includes('io(')) {
    console.error('❌ Classroom component should establish socket connection');
    hasErrors = true;
  }
  
  if (!componentContent.includes('path: "/api/socket_io"')) {
    console.error('❌ Classroom component should specify socket.io path');
    hasErrors = true;
  }
}

// Check for proper error handling
console.log('\n🛡️  Checking error handling...');
const filesToCheck = [
  classroomComponentPath
];

filesToCheck.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('connect_error') && !content.includes('connection error')) {
      console.warn(`⚠️  ${path.basename(filePath)} might be missing connection error handling`);
    }
    
    if (!content.includes('disconnect') && !content.includes('cleanup')) {
      console.warn(`⚠️  ${path.basename(filePath)} might be missing proper disconnect cleanup`);
    }
  }
});

// Check environment variables
console.log('\n🔐 Checking environment variables...');
const envFile = path.join(PROJECT_ROOT, '.env');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  if (!envContent.includes('NEXT_PUBLIC_SITE_URL')) {
    console.warn('⚠️  Consider adding NEXT_PUBLIC_SITE_URL to .env for socket connections');
  }
}

console.log('\n🧪 Running socket configuration validation...');
// Test socket configuration
try {
  const { validateSocketConfig } = require('../src/lib/socket-health');
  
  // Test with localhost (common dev environment)
  const localhostResult = validateSocketConfig('http://localhost:9002', {
    transports: ['websocket', 'polling'],
    timeout: 10000
  });
  
  if (localhostResult.valid) {
    console.log('✅ Socket configuration for localhost is valid');
  } else {
    console.error('❌ Socket configuration for localhost has issues:');
    localhostResult.errors.forEach(err => console.error(`   - ${err}`));
    hasErrors = true;
  }
} catch (err) {
  console.error('❌ Failed to validate socket configuration:', err.message);
  hasErrors = true;
}

console.log('');

// Final result
if (hasErrors) {
  console.error('🚨 Socket validation failed! Please fix the issues above.');
  process.exit(1);
} else {
  console.log('🎉 All socket validations passed! Socket implementation looks good.');
  process.exit(0);
}