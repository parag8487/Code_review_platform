#!/bin/bash

# Build script for production deployment

echo "Starting production build process..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Run type checking
echo "Running type checking..."
npm run typecheck

# Build the Next.js application
echo "Building Next.js application..."
npm run build

echo "Build process completed successfully!"