import { NextRequest, NextResponse } from 'next/server';
import { CRMTool } from '@/lib/tools/crm-tool';

export const runtime = 'edge';

/**
 * API route for seeding test data
 * 
 * This endpoint seeds test data for the CRM and other systems
 * It can be called directly from the browser
 */
export async function GET(req: NextRequest) {
  try {
    // Seed CRM data
    const crmSuccess = await CRMTool.seedTestClients();
    
    return NextResponse.json({
      success: true,
      message: 'Test data seeded successfully',
      details: {
        crm: crmSuccess ? 'CRM data seeded successfully' : 'CRM data seeding skipped (data already exists)'
      }
    });
  } catch (error) {
    console.error('Error seeding test data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error seeding test data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 