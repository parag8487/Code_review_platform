import { NextResponse } from 'next/server';
import { detectLanguage } from '@/ai/flows/detect-language-flow';

export async function GET() {
  try {
    // Test the AI language detection with a simple code snippet
    const testCode = `function hello() {
  console.log("Hello, world!");
}`;
    
    const result = await detectLanguage({ code: testCode });
    
    return NextResponse.json({ 
      success: true, 
      message: 'AI integration is working',
      detectedLanguage: result.language
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'AI integration test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}