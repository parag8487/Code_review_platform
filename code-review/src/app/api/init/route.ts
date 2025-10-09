import { NextResponse } from 'next/server';
import initDatabase from '@/lib/init-db';

export async function GET() {
  try {
    console.log('Starting database initialization...');
    await initDatabase();
    console.log('Database initialization completed successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    console.error('Database initialization failed:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Database initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}