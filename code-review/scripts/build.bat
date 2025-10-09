@echo off
REM Build script for production deployment on Windows

echo Starting production build process...

REM Install dependencies
echo Installing dependencies...
npm ci

REM Run type checking
echo Running type checking...
npm run typecheck

REM Build the Next.js application
echo Building Next.js application...
npm run build

echo Build process completed successfully!