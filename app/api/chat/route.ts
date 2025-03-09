import { openai } from '@ai-sdk/openai';
import { ChatService } from '@/lib/services/chat-service';
import config from '@/config';
import { CerebrasLogger } from '@/lib/utils/cerebras-logger';
import { convertToCoreMessages, streamText } from 'ai';
import { CRMTool } from '@/lib/tools/crm-tool';
import { Client } from '@/components/crm/columns';

// Set runtime to edge for best performance
export const runtime = 'edge';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface CRMQueryResult {
  type: 'client' | 'clients' | 'follow-ups';
  data: Client | Client[];
  source: string;
  query: string | number;
  phoneQuery?: boolean; // Optional flag to indicate if the query is about a phone number
}

// Function to extract CRM queries from user messages
async function processCRMQueries(message: string): Promise<CRMQueryResult | null> {
  const logger = new CerebrasLogger();
  logger.info(`Processing message for CRM queries: "${message}"`);
  
  // First, extract any email addresses from the message to avoid them being included in name matches
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emailMatches = message.match(emailRegex);
  let messageWithoutEmails = message;
  
  if (emailMatches) {
    // Replace emails with placeholders to avoid them being included in name matches
    emailMatches.forEach((email, index) => {
      messageWithoutEmails = messageWithoutEmails.replace(email, `__EMAIL_${index}__`);
    });
    logger.info(`Extracted emails: ${JSON.stringify(emailMatches)}`);
    logger.info(`Message without emails: "${messageWithoutEmails}"`);
  }
  
  // More comprehensive pattern matching for CRM-related queries
  const clientIdMatch = messageWithoutEmails.match(/client(?:\s+with)?\s+id\s+(\d+)/i);
  
  // Enhanced name matching to catch more variations
  const clientNameMatch = messageWithoutEmails.match(/(?:client|customer|contact)(?:\s+named|\s+called|\s+by the name)?\s+([A-Za-z\s]+?)(?:\s|'s|\?|$|__EMAIL_)/i) || 
                          messageWithoutEmails.match(/(?:what|tell me|show|find|get)(?:\s+do you know|\s+information)?\s+about\s+([A-Za-z\s]+?)(?:'s|\s+client|\s+customer|\s+contact|\s+information|\s+details|\s+data|\?|$|__EMAIL_)/i) ||
                          messageWithoutEmails.match(/([A-Za-z\s]+?)(?:'s|\s+client|\s+customer|\s+contact)?\s+(?:information|details|data|property|properties|record|profile)/i) ||
                          // Direct search patterns
                          messageWithoutEmails.match(/(?:find|search for|look up|locate)\s+([A-Za-z\s]+)(?:\s+in the (?:crm|database|system)|\s+for me|\?|$|__EMAIL_)/i) ||
                          messageWithoutEmails.match(/(?:do we have|is there|can you find)(?:\s+a)?\s+(?:client|customer|contact|record)(?:\s+named|\s+called|\s+for)?\s+([A-Za-z\s]+)/i);
  
  // Process email matches separately
  const clientEmailMatch = emailMatches && emailMatches.length > 0 
    ? { 1: emailMatches[0] } // Create an object that mimics regex match result
    : messageWithoutEmails.match(/client(?:\s+with)?\s+email\s+([^\s]+@[^\s]+)/i);
  
  // Enhanced status matching
  const clientStatusMatch = messageWithoutEmails.match(/clients?\s+(?:with|having|in|of)\s+status\s+([A-Za-z]+)/i) ||
                            messageWithoutEmails.match(/(?:show|find|get|list)\s+(?:all\s+)?([A-Za-z]+)\s+(?:status\s+)?clients/i);
  
  // Enhanced follow-up matching
  const followUpMatch = messageWithoutEmails.match(/follow(?:-|\s)ups?\s+(?:in|for|within|next)\s+(\d+)\s+days/i) ||
                        messageWithoutEmails.match(/(?:clients|customers|contacts)\s+(?:with|having)\s+follow(?:-|\s)ups?\s+(?:in|for|within|next)\s+(\d+)\s+days/i) ||
                        messageWithoutEmails.match(/(?:who|which\s+clients)\s+(?:needs|need|has|have|requires|require)\s+follow(?:-|\s)ups?\s+(?:in|for|within|next)\s+(\d+)\s+days/i);
  
  // Property matching
  const propertyMatch = messageWithoutEmails.match(/(?:what|tell me|show|find|get)(?:\s+do you know|\s+information)?\s+about\s+([A-Za-z\s]+?)(?:'s)?\s+property/i);
  
  // Phone number matching
  const phoneMatch = messageWithoutEmails.match(/(?:what(?:'s|\s+is)|find|get|show me)\s+(?:the\s+)?phone(?:\s+number)?\s+(?:for|of)\s+([A-Za-z\s]+)/i) ||
                     message.includes("phone") || message.includes("number");
  
  // Log all matches for debugging
  logger.info('CRM query matches:', {
    clientIdMatch: clientIdMatch ? clientIdMatch[1] : null,
    clientNameMatch: clientNameMatch ? clientNameMatch[1] : null,
    clientEmailMatch: clientEmailMatch ? clientEmailMatch[1] : null,
    clientStatusMatch: clientStatusMatch ? clientStatusMatch[1] : null,
    followUpMatch: followUpMatch ? followUpMatch[1] : null,
    propertyMatch: propertyMatch ? propertyMatch[1] : null,
    phoneMatch: phoneMatch ? (typeof phoneMatch === 'boolean' ? true : phoneMatch[1]) : null
  });
  
  let crmData: CRMQueryResult | null = null;
  
  // First try to find by email if available
  if (clientEmailMatch && clientEmailMatch[1]) {
    const email = clientEmailMatch[1].trim();
    logger.info(`Processing client email query: "${email}"`);
    const clients = await CRMTool.searchClientsByEmail(email);
    if (clients && clients.length > 0) {
      crmData = {
        type: 'clients',
        data: clients,
        source: 'email',
        query: email
      };
      logger.info(`Found ${clients.length} clients matching email "${email}"`);
    } else {
      logger.info(`No clients found matching email "${email}"`);
    }
  }
  
  // If no results from email, try by ID
  if (!crmData && clientIdMatch && clientIdMatch[1]) {
    const clientId = parseInt(clientIdMatch[1], 10);
    logger.info(`Processing client ID query: ${clientId}`);
    const client = await CRMTool.getClientById(clientId);
    if (client) {
      crmData = {
        type: 'client',
        data: client,
        source: 'id',
        query: clientId
      };
      logger.info(`Found client with ID ${clientId}`);
    } else {
      logger.info(`No client found with ID ${clientId}`);
    }
  }
  
  // If still no results, try by name
  if (!crmData && clientNameMatch && clientNameMatch[1]) {
    const name = clientNameMatch[1].trim();
    logger.info(`Processing client name query: "${name}"`);
    const clients = await CRMTool.searchClientsByName(name);
    if (clients && clients.length > 0) {
      crmData = {
        type: 'clients',
        data: clients,
        source: 'name',
        query: name
      };
      logger.info(`Found ${clients.length} clients matching name "${name}"`);
    } else {
      logger.info(`No clients found matching name "${name}"`);
      
      // If no exact match, try to search for first name and last name separately
      if (name.includes(' ')) {
        const nameParts = name.split(' ');
        if (nameParts.length >= 2) {
          const firstName = nameParts[0];
          const lastName = nameParts[nameParts.length - 1];
          
          logger.info(`Trying to search by first name: "${firstName}"`);
          const firstNameClients = await CRMTool.searchClientsByName(firstName);
          
          if (firstNameClients && firstNameClients.length > 0) {
            crmData = {
              type: 'clients',
              data: firstNameClients,
              source: 'first_name',
              query: firstName
            };
            logger.info(`Found ${firstNameClients.length} clients matching first name "${firstName}"`);
          } else {
            logger.info(`No clients found matching first name "${firstName}"`);
            
            logger.info(`Trying to search by last name: "${lastName}"`);
            const lastNameClients = await CRMTool.searchClientsByName(lastName);
            
            if (lastNameClients && lastNameClients.length > 0) {
              crmData = {
                type: 'clients',
                data: lastNameClients,
                source: 'last_name',
                query: lastName
              };
              logger.info(`Found ${lastNameClients.length} clients matching last name "${lastName}"`);
            } else {
              logger.info(`No clients found matching last name "${lastName}"`);
            }
          }
        }
      }
    }
  }
  
  // If still no results, try property query
  if (!crmData && propertyMatch && propertyMatch[1]) {
    const name = propertyMatch[1].trim();
    logger.info(`Processing property query for: "${name}"`);
    const clients = await CRMTool.searchClientsByName(name);
    if (clients && clients.length > 0) {
      crmData = {
        type: 'clients',
        data: clients,
        source: 'name',
        query: name
      };
      logger.info(`Found ${clients.length} clients matching property owner "${name}"`);
    } else {
      logger.info(`No clients found matching property owner "${name}"`);
    }
  }
  
  // If still no results, try status query
  if (!crmData && clientStatusMatch && clientStatusMatch[1]) {
    const status = clientStatusMatch[1].trim();
    logger.info(`Processing client status query: "${status}"`);
    const clients = await CRMTool.getClientsByStatus(status);
    if (clients && clients.length > 0) {
      crmData = {
        type: 'clients',
        data: clients,
        source: 'status',
        query: status
      };
      logger.info(`Found ${clients.length} clients with status "${status}"`);
    } else {
      logger.info(`No clients found with status "${status}"`);
    }
  }
  
  // If still no results, try follow-up query
  if (!crmData && followUpMatch && followUpMatch[1]) {
    const days = parseInt(followUpMatch[1], 10);
    logger.info(`Processing follow-up query for next ${days} days`);
    const clients = await CRMTool.getClientsWithUpcomingFollowUps(days);
    if (clients && clients.length > 0) {
      crmData = {
        type: 'follow-ups',
        data: clients,
        source: 'days',
        query: days
      };
      logger.info(`Found ${clients.length} clients with follow-ups in the next ${days} days`);
    } else {
      logger.info(`No clients found with follow-ups in the next ${days} days`);
    }
  } else {
    logger.info('No CRM query patterns matched in the message');
  }
  
  // Add phone number context if the query is about a phone number
  if (crmData && phoneMatch) {
    crmData.phoneQuery = true;
  }
  
  return crmData;
}

export async function POST(req: Request) {
  const logger = new CerebrasLogger();
  
  try {
    // Parse the request body
    const { messages, conversationId } = await req.json();
    const lastMessage = messages[messages.length - 1];
    
    logger.info('Processing chat request');
    logger.info(`Messages count: ${messages.length}, Last message: ${JSON.stringify(lastMessage)}`);

    // Check if the message contains CRM-related queries
    const crmData = await processCRMQueries(lastMessage.content);
    
    // Enhance system prompt with CRM data if available
    let systemPrompt = "You are Dibs AI, an intelligent real estate assistant. You help users find, analyze, and make smarter property decisions with AI-powered insights. Be helpful, accurate, and provide detailed information about real estate topics including property values, market trends, investment strategies, mortgages, and more.";
    
    // Check if the message appears to be a CRM query but no data was found
    const isCRMQueryWithNoData = !crmData && (
      lastMessage.content.match(/(?:find|search for|look up|locate|tell me about|what do you know about|show me|get|information about)\s+([A-Za-z\s]+)/i) ||
      lastMessage.content.match(/([A-Za-z\s]+?)(?:'s|\s+client|\s+customer|\s+contact)?\s+(?:information|details|data|property|properties|record|profile)/i)
    );
    
    if (crmData) {
      // Add CRM data to the system prompt
      systemPrompt += "\n\nI have access to the following CRM data that might be relevant to the user's query:";
      systemPrompt += `\n\nCRM Data (${crmData.type} by ${crmData.source}: ${crmData.query}):\n`;
      
      if (crmData.type === 'client') {
        // Format single client data
        systemPrompt += `${CRMTool.formatClientAsJson(crmData.data as Client)}`;
        
        // Add specific instructions for client data
        systemPrompt += "\n\nPlease use this client data to provide a helpful response. Make sure to reference specific details from the client record such as their contact information, property preferences, budget, and status. Format your response in a clear, professional manner as if you are a real estate agent speaking to a colleague.";
        
        // Add specific instructions for phone number queries
        if (crmData.phoneQuery) {
          systemPrompt += "\n\nThe user is specifically asking about a phone number. Make sure to prominently include the phone number in your response if available.";
        }
      } else {
        // Format multiple clients data (limit to 5 for brevity)
        const clientsArray = crmData.data as Client[];
        const limitedData = clientsArray.slice(0, 5);
        systemPrompt += `${CRMTool.formatClientsAsJson(limitedData)}`;
        
        if (clientsArray.length > 5) {
          systemPrompt += `\n\n(Showing 5 of ${clientsArray.length} results)`;
        }
        
        // Add specific instructions for multiple clients
        systemPrompt += "\n\nPlease use this client data to provide a helpful response. Summarize the key information about these clients in a clear, organized way. If the user is asking about a specific client, focus on that client's details. If they're asking about multiple clients or trends, provide a summary of the relevant information.";
        
        // Add specific instructions for phone number queries
        if (crmData.phoneQuery) {
          systemPrompt += "\n\nThe user is specifically asking about a phone number. Make sure to prominently include the phone number(s) in your response if available.";
        }
      }
      
      // Add general instructions for using CRM data
      systemPrompt += "\n\nWhen responding, always acknowledge that you're using CRM records to answer the query. For example, 'Based on our CRM records, I can see that...' or 'According to our database...'. This helps the user understand the source of your information.";
    } else if (isCRMQueryWithNoData) {
      // Add specific instructions for when a CRM query is detected but no data is found
      systemPrompt += "\n\nThe user appears to be asking about client data, but I don't have any matching records in the CRM database. Please respond by:";
      systemPrompt += "\n1. Acknowledging that you searched the CRM but couldn't find matching records";
      systemPrompt += "\n2. Offering to help them add this information to the CRM or search with different criteria";
      systemPrompt += "\n3. Asking for more specific details that might help locate the record";
      systemPrompt += "\n4. Suggesting they check the spelling of names or try alternative search terms";
      
      // Extract the potential name from the query for a more personalized response
      const nameMatch = lastMessage.content.match(/(?:find|search for|look up|locate|about)\s+([A-Za-z\s]+?)(?:\s|'s|\?|$|\s+in)/i);
      if (nameMatch && nameMatch[1]) {
        const potentialName = nameMatch[1].trim();
        systemPrompt += `\n\nThe user appears to be looking for information about "${potentialName}". Please acknowledge this specific name in your response.`;
      }
    } else {
      // Add instructions for when no CRM data is found and it's not a CRM query
      systemPrompt += "\n\nIf the user asks about specific clients, properties, or CRM data that you don't have information about, explain that you don't have that specific information in your database, but offer to help them find or input that information.";
    }
    
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