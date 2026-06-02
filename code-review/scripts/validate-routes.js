#!/usr/bin/env node

/**
 * Route Validation Script
 * Validates that all required routes and API endpoints exist
 * and are properly configured.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const APP_DIR = path.join(PROJECT_ROOT, 'src', 'app');

// Required page routes
const REQUIRED_ROUTES = [
  'classroom',
  'classroom/[id]',
  'code-editor',
  'code-review',
  'contact',
  'welcome',
];

// Required API routes
const REQUIRED_API_ROUTES = [
  'api/ably-token',
  'api/classroom/create',
  'api/classroom/delete',
  'api/classroom/get',
  'api/classroom/join',
  'api/classroom/kick',
  'api/classroom/leave',
  'api/classroom/list',
  'api/classroom/permission',
  'api/health',
];

console.log('🔍 Validating project routes...\n');

let hasErrors = false;

// Check page routes
console.log('📁 Checking page routes...');
REQUIRED_ROUTES.forEach(route => {
  const routeDir = path.join(APP_DIR, route);
  const pageFile = path.join(routeDir, 'page.tsx');
  if (!fs.existsSync(routeDir) || !fs.existsSync(pageFile)) {
    console.error(`  ❌ Missing: /${route}`);
    hasErrors = true;
  } else {
    console.log(`  ✅ /${route}`);
  }
});

console.log('');

// Check API routes
console.log('🔌 Checking API routes...');
REQUIRED_API_ROUTES.forEach(route => {
  const routeDir = path.join(APP_DIR, route);
  const routeFile = path.join(routeDir, 'route.ts');
  if (!fs.existsSync(routeDir) || !fs.existsSync(routeFile)) {
    console.error(`  ❌ Missing: /${route}`);
    hasErrors = true;
  } else {
    console.log(`  ✅ /${route}`);
  }
});

console.log('');

// Check critical lib files
console.log('📦 Checking core library files...');
const criticalFiles = [
  'src/lib/realtime.ts',
  'src/lib/classroom-store.ts',
];
criticalFiles.forEach(file => {
  const filePath = path.join(PROJECT_ROOT, file);
  if (!fs.existsSync(filePath)) {
    console.error(`  ❌ Missing: ${file}`);
    hasErrors = true;
  } else {
    console.log(`  ✅ ${file}`);
  }
});

console.log('');

// Check environment variables
console.log('🔐 Checking environment configuration...');
const envPath = path.join(PROJECT_ROOT, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = ['ABLY_API_KEY', 'NEXT_PUBLIC_SITE_URL'];
  requiredVars.forEach(v => {
    if (envContent.includes(v)) {
      console.log(`  ✅ ${v} is defined`);
    } else {
      console.error(`  ❌ Missing: ${v}`);
      hasErrors = true;
    }
  });
} else {
  console.error('  ❌ .env file not found');
  hasErrors = true;
}

console.log('');

if (hasErrors) {
  console.error('🚨 Validation failed! Fix the issues above.');
  process.exit(1);
} else {
  console.log('🎉 All validations passed!');
  process.exit(0);
}
