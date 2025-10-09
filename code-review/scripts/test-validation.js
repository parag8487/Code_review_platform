#!/usr/bin/env node

/**
 * Test Validation Script
 * This script tests that our validation system works correctly.
 */

const { spawnSync } = require('child_process');
const path = require('path');

console.log('🧪 Testing validation system...\n');

// Test route validation
console.log('1. Testing route validation...');
const validateScript = path.join(__dirname, 'validate-routes.js');
const validateResult = spawnSync('node', [validateScript], { 
  cwd: path.join(__dirname, '..'),
  stdio: 'pipe'
});

if (validateResult.status === 0) {
  console.log('✅ Route validation passed');
} else {
  console.error('❌ Route validation failed');
  console.error(validateResult.stdout.toString());
  console.error(validateResult.stderr.toString());
}

console.log('\n2. Testing TypeScript compilation...');
const typeCheckResult = spawnSync('npm', ['run', 'typecheck'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'pipe'
});

if (typeCheckResult.status === 0) {
  console.log('✅ TypeScript compilation passed');
} else {
  console.error('❌ TypeScript compilation failed');
  console.error(typeCheckResult.stdout.toString());
  console.error(typeCheckResult.stderr.toString());
}

console.log('\n✅ All tests completed!');