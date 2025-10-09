# Deployment Guide

This guide explains how to properly deploy the application to avoid common errors like 404s and routing issues.

## Common Issues and Prevention

### 1. 404 Errors on Routes

**Problem**: Users encounter 404 errors when navigating to specific pages like `/classroom`.

**Prevention**:
- Always ensure that new routes have corresponding files in the `src/app` directory
- Update `vercel.json` when adding new routes
- Run validation scripts before deployment

**Validation Command**:
```bash
npm run validate
```

### 2. Socket.IO Connection Issues

**Problem**: Socket.IO connections fail in production environments.

**Prevention**:
- Use global variables for socket state management in serverless environments
- Ensure proper CORS configuration
- Test socket connections in both development and production environments

### 3. Missing API Endpoints

**Problem**: API endpoints return 404 errors.

**Prevention**:
- All API routes must be located in `src/app/api/` directory
- Follow the Next.js App Router naming conventions (`route.ts` files)
- Test all API endpoints before deployment

## Validation Scripts

### Route Validation
```bash
npm run validate
```
This script checks:
- Required routes exist
- API endpoints are properly configured
- Vercel configuration files are valid

### Pre-commit Validation
```bash
npm run precommit
```
This script runs:
- Route validation
- TypeScript type checking

## Deployment Checklist

Before deploying to Vercel:

1. [ ] Run route validation: `npm run validate`
2. [ ] Check TypeScript compilation: `npm run typecheck`
3. [ ] Verify all required routes exist
4. [ ] Test API endpoints locally
5. [ ] Check Vercel configuration files
6. [ ] Ensure environment variables are set

## Vercel Configuration

Ensure `vercel.json` is properly configured:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/socket_io(.*)",
      "dest": "/api/socket_io"
    },
    {
      "src": "/api/socket(.*)",
      "dest": "/api/socket"
    },
    {
      "src": "/classroom/(.*)",
      "dest": "/classroom"
    },
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SITE_URL`: The URL of your deployed application
- Database connection variables
- API keys

Set these in Vercel dashboard under "Settings" → "Environment Variables".

## Troubleshooting

### If you encounter 404 errors:

1. Check that the route file exists in `src/app/`
2. Verify Vercel routing configuration
3. Ensure the file exports a default component
4. Check for typos in file/folder names

### If Socket.IO connections fail:

1. Verify the socket.io server is properly initialized
2. Check CORS configuration
3. Ensure `NEXT_PUBLIC_SITE_URL` is set correctly
4. Test connection locally first

### If API endpoints return 404:

1. Verify the route file exists in `src/app/api/`
2. Check that the file is named `route.ts`
3. Ensure the correct HTTP method is exported (GET, POST, etc.)
4. Test the endpoint locally

## Automated Prevention

This project includes automated validation:
- Pre-commit hooks that run validation checks
- Route validation script
- TypeScript compilation checks

These help prevent common deployment issues before they reach production.