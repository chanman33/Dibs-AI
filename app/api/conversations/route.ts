import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/lib/services/chat-service';
import config from '@/config';

// Set runtime to edge for best performance
export const runtime = 'edge';

// Demo user ID to use when auth is disabled
const DEMO_USER_ID = "demo-user";

export async function GET(req: NextRequest) {
  try {
    // Use demo user ID since auth is disabled
    const userId = DEMO_USER_ID;
    
    // Get all conversations for the user
    const conversations = await ChatService.getUserConversations(userId);
    
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ conversations: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Use demo user ID since auth is disabled
    const userId = DEMO_USER_ID;
    
    // Parse the request body
    const { title, propertyId } = await req.json();
    
    // Create a new conversation
    const conversationId = await ChatService.createConversation(userId, title, propertyId);
    
    if (!conversationId) {
      throw new Error('Failed to create conversation');
    }
    
    return NextResponse.json({ conversationId });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Error creating conversation' }, { status: 500 });
  }
} 