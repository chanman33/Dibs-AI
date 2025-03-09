import { streamText } from 'ai';
import { cerebras } from '@ai-sdk/cerebras';

// Set runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  // Create a streaming response using Cerebras
  const result = await streamText({
    model: cerebras('llama3.3-70b'),
    prompt: lastMessage.content,
  });

  // Return the streaming response
  return result.toTextStreamResponse();
} 