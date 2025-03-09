import { streamText } from 'ai';
import { cerebras } from '@ai-sdk/cerebras';
import { ChatService } from '@/lib/services/chat-service';
import config from '@/config';
import { CerebrasLogger } from '@/lib/utils/cerebras-logger';

// Set runtime to edge for best performance
export const runtime = 'edge';

// Define types for Cerebras response
interface CerebrasResponse {
  id?: string;
  headers?: Record<string, string>;
  [key: string]: any;
}

export async function POST(req: Request) {
  const logger = new CerebrasLogger();
  let responseText = '';
  
  try {
    // Parse the request body
    const { messages, conversationId } = await req.json();
    const lastMessage = messages[messages.length - 1];
    
    logger.info('Processing chat request');
    
    // Create streaming options for Cerebras
    const streamOptions = {
      model: cerebras('llama3.3-70b'),
      prompt: lastMessage.content,
      system: "You are Dibs AI, an intelligent real estate assistant. You help users find, analyze, and make smarter property decisions with AI-powered insights. Be helpful, accurate, and provide detailed information about real estate topics including property values, market trends, investment strategies, mortgages, and more.",
    };
    
    // Log the request details
    logger.logRequest(lastMessage.content, {
      model: 'llama3.3-70b',
      conversationId,
      messageCount: messages.length
    });

    // Use the AI SDK to stream the response
    const result = await streamText(streamOptions);
    
    // Attach event listeners to capture response details
    if (result.response && typeof result.response.then === 'function') {
      result.response.then((res: any) => {
        logger.logResponse(res || {});
      }).catch((err: Error) => {
        logger.error('Error getting response metadata', err);
      });
    }
    
    // Capture the full text when complete
    result.text.then((text: string) => {
      responseText = text;
      logger.logCompletion(text);
      
      // Save the AI response to the database
      if (config.auth.enabled === false && conversationId) {
        saveAIResponseToDatabase("demo-user", text, conversationId).catch(error => {
          logger.error('Error saving AI response to database', error);
        });
      }
    }).catch((err: Error) => {
      logger.error('Error getting response text', err);
    });

    // Save the user message to the database
    if (config.auth.enabled === false) {
      // Use a demo user ID when auth is disabled
      // We'll handle this asynchronously to not block the response
      saveMessageToDatabase("demo-user", lastMessage, conversationId).catch(error => {
        logger.error('Error saving message to database', error);
      });
    }

    logger.info('Returning streaming response');
    
    // Return the streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    logger.logError(error);
    return new Response('Error processing your request', { status: 500 });
  }
}

// Helper function to save user messages to the database
async function saveMessageToDatabase(userId: string, message: any, conversationId?: number) {
  try {
    let actualConversationId = conversationId;
    
    // If no conversationId is provided, create a new conversation
    if (!actualConversationId) {
      // Create a new conversation
      actualConversationId = await ChatService.createConversation(
        userId,
        message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
      );
    }

    if (actualConversationId) {
      // Save the user message
      await ChatService.addMessage({
        content: message.content,
        role: 'user',
        conversation_id: actualConversationId
      });
    }
    
    return actualConversationId;
  } catch (error) {
    console.error('Error saving message to database:', error);
    throw error;
  }
}

// Helper function to save AI responses to the database
async function saveAIResponseToDatabase(userId: string, responseText: string, conversationId: number) {
  try {
    if (!responseText || !conversationId) return;
    
    // Save the AI response
    await ChatService.addMessage({
      content: responseText,
      role: 'assistant',
      conversation_id: conversationId
    });
    
    console.log(`Saved AI response to conversation ${conversationId}`);
  } catch (error) {
    console.error('Error saving AI response to database:', error);
  }
} 