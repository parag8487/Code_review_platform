import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { updateUserProfile } from '@/lib/actions';

export async function POST(request: Request) {
  try {
    // Verify user session
    const { isAuth, userId } = await verifySession();
    
    if (!isAuth || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // In a real application, you would upload the file to a storage service here
    // For example, using AWS S3, Cloudinary, or similar services
    // For this demo, we'll just return a placeholder URL
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // In a real implementation, you would:
    // 1. Upload the file to your storage service
    // 2. Get the URL of the uploaded file
    // 3. Update the user's avatar_url in the database
    // 4. Return the new avatar URL

    // For demonstration purposes, we'll generate a placeholder URL
    const avatarUrl = `/api/avatars/${userId}-${Date.now()}.${file.type.split('/')[1]}`;

    // Update user profile with new avatar URL
    try {
      await updateUserProfile(userId, { avatar_url: avatarUrl });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      avatarUrl,
      message: 'Avatar updated successfully' 
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}