import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/lib/services/chat-service';
import config from '@/config';

// Set runtime to edge for best performance
export const runtime = 'edge';

// Demo user ID to use when auth is disabled
const DEMO_USER_ID = "demo-user";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use demo user ID since auth is disabled
    const userId = DEMO_USER_ID;

    const conversationId = parseInt(params.id);
    
    // Get the conversation
    const conversation = await ChatService.getConversation(conversationId);
    
    if (!conversation) {
      return NextResponse.json({ 
        conversation: { 
          id: conversationId,
          title: 'Conversation not found',
          user_id: userId,
          messages: []
        } 
      });
    }
    
    // Get the messages for the conversation
    const messages = await ChatService.getConversationMessages(conversationId);
    
    return NextResponse.json({ 
      conversation: {
        ...conversation,
        messages
      }
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ 
      conversation: { 
        id: parseInt(params.id),
        title: 'Error loading conversation',
        user_id: DEMO_USER_ID,
        messages: []
      } 
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = parseInt(params.id);
    
    // Get the conversation
    const conversation = await ChatService.getConversation(conversationId);
    
    if (!conversation) {
      return NextResponse.json({ success: false, message: 'Conversation not found' });
    }
    
    // Delete the conversation
    await ChatService.deleteConversation(conversationId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json({ success: false, message: 'Error deleting conversation' });
  }
} 