#!/usr/bin/env node

/**
 * Route Validation Script
 * This script validates that all required routes and API endpoints exist
 * and are properly configured to prevent 404 errors.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const APP_DIR = path.join(SRC_DIR, 'app');
const API_DIR = path.join(APP_DIR, 'api');

// Required routes that must exist
const REQUIRED_ROUTES = [
  '/classroom',
  '/classroom/[id]',
  '/api/socket_io',
  '/api/socket'
];

// Required API files that must exist
const REQUIRED_API_FILES = [
  'src/app/api/socket_io/route.ts',
  'src/app/api/socket/route.ts'
];

// Vercel config files to validate
const VERCEL_CONFIG_FILES = [
  'vercel.json'
];

console.log('🔍 Validating project routes and configurations...\n');

let hasErrors = false;

// Check if required app routes exist
console.log('📁 Checking required app routes...');
REQUIRED_ROUTES.forEach(route => {
  const routePath = path.join(APP_DIR, ...route.replace('/api/', 'api/').split('/').filter(Boolean));
  if (!fs.existsSync(routePath)) {
    console.error(`❌ Missing route: ${route} (${routePath})`);
    hasErrors = true;
  } else {
    console.log(`✅ Found route: ${route}`);
  }
});

console.log('');

// Check if required API files exist
console.log('🔌 Checking required API files...');
REQUIRED_API_FILES.forEach(file => {
  const filePath = path.join(PROJECT_ROOT, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing API file: ${file}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found API file: ${file}`);
  }
});

console.log('');

// Validate Vercel configuration files
console.log('⚙️  Validating Vercel configuration...');
VERCEL_CONFIG_FILES.forEach(configFile => {
  const configPath = path.join(PROJECT_ROOT, configFile);
  if (!fs.existsSync(configPath)) {
    console.error(`❌ Missing Vercel config: ${configFile}`);
    hasErrors = true;
  } else {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (!config.routes || !Array.isArray(config.routes)) {
        console.error(`❌ Invalid Vercel config: ${configFile} (missing routes array)`);
        hasErrors = true;
      } else {
        console.log(`✅ Valid Vercel config: ${configFile}`);
      }
    } catch (err) {
      console.error(`❌ Invalid Vercel config: ${configFile} (JSON parse error)`);
      hasErrors = true;
    }
  }
});

console.log('');

// Check for common socket.io issues
console.log('🔌 Checking socket.io implementation...');
const socketIoRoutePath = path.join(PROJECT_ROOT, 'src/app/api/socket_io/route.ts');
if (fs.existsSync(socketIoRoutePath)) {
  const content = fs.readFileSync(socketIoRoutePath, 'utf8');
  const issues = [];
  
  if (!content.includes('Server as ServerIO')) {
    issues.push('Missing ServerIO import');
  }
  
  if (!content.includes('path: "/api/socket_io"')) {
    issues.push('Missing socket.io path configuration');
  }
  
  if (issues.length > 0) {
    console.error(`❌ Socket.io issues found:`);
    issues.forEach(issue => console.error(`   - ${issue}`));
    hasErrors = true;
  } else {
    console.log(`✅ Socket.io implementation looks good`);
  }
} else {
  console.error(`❌ Socket.io route file not found`);
  hasErrors = true;
}

console.log('');

// Final result
if (hasErrors) {
  console.error('🚨 Validation failed! Please fix the issues above.');
  process.exit(1);
} else {
  console.log('🎉 All validations passed! Routes and configurations are correct.');
  process.exit(0);
}