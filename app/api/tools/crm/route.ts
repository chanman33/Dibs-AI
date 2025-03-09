import { NextRequest, NextResponse } from 'next/server';
import { CRMTool } from '@/lib/tools/crm-tool';

export const runtime = 'edge';

/**
 * API route for CRM tool
 * 
 * This route allows the AI agent to interact with CRM data,
 * query client information, and perform actions based on user requests.
 */
export async function POST(req: NextRequest) {
  try {
    const { action, params } = await req.json();
    
    // Validate the request
    if (!action) {
      return NextResponse.json(
        { error: 'Missing required parameter: action' },
        { status: 400 }
      );
    }
    
    // Process the request based on the action
    switch (action) {
      case 'getClientById': {
        if (!params?.clientId) {
          return NextResponse.json(
            { error: 'Missing required parameter: clientId' },
            { status: 400 }
          );
        }
        
        const client = await CRMTool.getClientById(Number(params.clientId));
        
        if (!client) {
          return NextResponse.json(
            { error: `Client with ID ${params.clientId} not found` },
            { status: 404 }
          );
        }
        
        return NextResponse.json({ client });
      }
      
      case 'searchClientsByName': {
        if (!params?.name) {
          return NextResponse.json(
            { error: 'Missing required parameter: name' },
            { status: 400 }
          );
        }
        
        const clients = await CRMTool.searchClientsByName(params.name);
        return NextResponse.json({ clients });
      }
      
      case 'searchClientsByEmail': {
        if (!params?.email) {
          return NextResponse.json(
            { error: 'Missing required parameter: email' },
            { status: 400 }
          );
        }
        
        const clients = await CRMTool.searchClientsByEmail(params.email);
        return NextResponse.json({ clients });
      }
      
      case 'getClientsByStatus': {
        if (!params?.status) {
          return NextResponse.json(
            { error: 'Missing required parameter: status' },
            { status: 400 }
          );
        }
        
        const clients = await CRMTool.getClientsByStatus(params.status);
        return NextResponse.json({ clients });
      }
      
      case 'updateClient': {
        if (!params?.clientId || !params?.updates) {
          return NextResponse.json(
            { error: 'Missing required parameters: clientId and/or updates' },
            { status: 400 }
          );
        }
        
        const client = await CRMTool.updateClient(
          Number(params.clientId),
          params.updates
        );
        
        if (!client) {
          return NextResponse.json(
            { error: `Failed to update client with ID ${params.clientId}` },
            { status: 500 }
          );
        }
        
        return NextResponse.json({ client });
      }
      
      case 'getClientsWithUpcomingFollowUps': {
        const days = params?.days ? Number(params.days) : 7;
        const clients = await CRMTool.getClientsWithUpcomingFollowUps(days);
        return NextResponse.json({ clients });
      }
      
      default:
        return NextResponse.json(
          { error: `Unsupported action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing CRM tool request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 