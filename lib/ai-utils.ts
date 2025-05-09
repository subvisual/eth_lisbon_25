/**
 * A simple StreamingTextResponse class to handle streaming text responses
 */
export class StreamingTextResponse extends Response {
  constructor(
    body: ReadableStream | ArrayBuffer | Buffer | string | null,
    init?: ResponseInit
  ) {
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'text/event-stream');
    headers.set('Cache-Control', 'no-cache');
    headers.set('Connection', 'keep-alive');
    
    super(body, {
      ...init,
      headers,
      status: init?.status ?? 200,
    });
  }
} 
