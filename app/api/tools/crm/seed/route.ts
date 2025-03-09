import { NextRequest, NextResponse } from 'next/server';
import { CRMTool } from '@/lib/tools/crm-tool';

export const runtime = 'edge';

/**
 * API route for seeding test client data
 * 
 * This is useful for testing the CRM integration with the AI agent
 * Only available in development mode
 */
export async function GET(req: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }
  
  try {
    const success = await CRMTool.seedTestClients();
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Test client data seeded successfully'
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to seed test client data' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error seeding test client data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 