import { NextResponse } from 'next/server';

// This is a placeholder API route for serving individual avatars
// In a real application, you would serve actual uploaded images from storage

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Extract user ID from the filename
  const userId = params.id.split('-')[0];
  
  // Generate a unique avatar based on user ID
  // In a real application, you would serve the actual uploaded image
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#7278F2" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="80" fill="white">
        ${userId.charAt(0).toUpperCase()}
      </text>
    </svg>
  `;
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });
}