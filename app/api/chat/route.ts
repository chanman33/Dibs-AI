import { openai } from '@ai-sdk/openai';
import { ChatService } from '@/lib/services/chat-service';
import config from '@/config';
import { CerebrasLogger } from '@/lib/utils/cerebras-logger';
import { convertToCoreMessages, streamText } from 'ai';

// Set runtime to edge for best performance
export const runtime = 'edge';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: Request) {
  const logger = new CerebrasLogger();
  
  try {
    // Parse the request body
    const { messages, conversationId } = await req.json();
    const lastMessage = messages[messages.length - 1];
    
    logger.info('Processing chat request');
    logger.info(`Messages count: ${messages.length}, Last message: ${JSON.stringify(lastMessage)}`);

    // System prompt for the real estate assistant
    const systemPrompt = "You are Dibs AI, an intelligent real estate assistant. You help users find, analyze, and make smarter property decisions with AI-powered insights. Be helpful, accurate, and provide detailed information about real estate topics including property values, market trends, investment strategies, mortgages, and more.";
    
    logger.info('Using OpenAI with Vercel AI SDK');

    // Save the user message to the database
    if (config.auth.enabled === false) {
      // Use a demo user ID when auth is disabled
      // We'll handle this asynchronously to not block the response
      logger.info('Saving message to database for demo user');
      saveMessageToDatabase("demo-user", lastMessage, conversationId).catch(error => {
        logger.error('Error saving message to database', error);
      });
    }

    // Convert messages to the format expected by AI SDK
    const coreMessages = convertToCoreMessages(messages);
    
    // Use the streamText function from AI SDK
    const result = streamText({
      model: openai('gpt-3.5-turbo'),
      system: systemPrompt,
      messages: coreMessages,
      temperature: 0.7,
      maxTokens: 2000,
      onFinish: async ({ text }) => {
        // Save the AI response to the database when complete
        if (config.auth.enabled === false && conversationId) {
          saveAIResponseToDatabase("demo-user", text, conversationId).catch(error => {
            logger.error('Error saving AI response to database', error);
          });
        }
      }
    });

    // Return the streaming response using the AI SDK's built-in method
    return result.toDataStreamResponse({
      // Provide a custom error message handler
      getErrorMessage: (error) => {
        logger.error('Error in stream processing', error);
        if (error instanceof Error) {
          return `Error: ${error.message}`;
        }
        return 'An error occurred while generating the response.';
      }
    });
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