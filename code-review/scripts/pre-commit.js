#!/usr/bin/env node

/**
 * Pre-commit Hook
 * This script runs validation checks before each commit to prevent
 * common errors like missing routes or incorrect configurations.
 */

const { spawnSync } = require('child_process');
const path = require('path');

console.log('🔍 Running pre-commit validation checks...\n');

// Run route validation
const validateScript = path.join(__dirname, 'validate-routes.js');
const validateResult = spawnSync('node', [validateScript], { stdio: 'inherit' });

if (validateResult.status !== 0) {
  console.error('\n❌ Pre-commit validation failed!');
  console.error('Please fix the issues before committing.');
  process.exit(1);
}

// Run TypeScript type checking
console.log('\n🔍 Running TypeScript type checking...');
const typeCheckResult = spawnSync('npm', ['run', 'typecheck'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
});

if (typeCheckResult.status !== 0) {
  console.error('\n❌ TypeScript type checking failed!');
  console.error('Please fix the type errors before committing.');
  process.exit(1);
}

console.log('\n✅ All pre-commit checks passed!');