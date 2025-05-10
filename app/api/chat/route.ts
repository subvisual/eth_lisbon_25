import { Message } from 'ai';
import { NextResponse } from 'next/server';
import { StreamingTextResponse } from '@/lib/ai-utils';
import { ollamaChat } from '@/lib/yield_strategist/api/ollama';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json() as { messages: Message[] };
    
    // Create a streaming text encoder
    const encoder = new TextEncoder();

    const ollamaToolsChatMessages = await ollamaChat(messages) as Message[];
    
    // Create a stream from the Ollama API
    const stream = new ReadableStream({
      async start(controller) {
        // Create fetch request to Ollama API
        const response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: '0xroyce/Plutus-3B',
            messages: ollamaToolsChatMessages.map(m => ({
              role: m.role,
              content: m.content,
            })),
            stream: true,
          }),
        });

        if (!response.body) {
          controller.error(new Error('No response body from Ollama'));
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Parse the chunk
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              try {
                const json = JSON.parse(line);
                if (json.message?.content) {
                  // Format as SSE message
                  const sseMessage = `data: ${JSON.stringify({ content: json.message.content })}\n\n`;
                  controller.enqueue(encoder.encode(sseMessage));
                }
              } catch (e) {
                console.error('Error parsing JSON from Ollama:', e);
              }
            }
          }
          
          // Signal completion
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Error processing Ollama stream:', error);
          controller.error(error);
        }
      }
    });

    // Return the streaming response
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
