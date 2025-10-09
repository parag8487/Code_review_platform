import { NextResponse } from 'next/server';

// This is a placeholder API route for serving avatars
// In a real application, you would serve actual uploaded images from storage

export async function GET(request: Request) {
  // Return a default avatar image
  // In a real application, you would serve the actual uploaded image
  const defaultAvatar = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#7278F2" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="40" fill="white">U</text>
    </svg>
  `;
  
  return new NextResponse(defaultAvatar, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}