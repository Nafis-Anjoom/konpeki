import connectDB from './db';
import cors from 'cors';
import 'dotenv/config';
import { handleRequest } from './routes';

const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

const app = {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight requests
    if (method === 'OPTIONS') {
      return handleCors(request);
    }

    // Create a mock response object for handleRequest
    let responseBody: any = {};
    let responseStatus: number = 200;

    const res = {
      status: (code: number) => {
        responseStatus = code;
        return res;
      },
      json: (data: any) => {
        responseBody = data;
      },
    };

    // Parse request body for POST requests
    let requestBody: any;
    let audioBuffer: ArrayBuffer | undefined;
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          requestBody = await request.json();
        } catch (error) {
          console.error('Error parsing JSON request body:', error);
          return createJsonResponse({ message: 'Invalid JSON body' }, 400);
        }
      } else if (contentType && contentType.includes('audio/webm')) {
        try {
          audioBuffer = await request.arrayBuffer();
        } catch (error) {
          console.error('Error parsing audio request body:', error);
          return createJsonResponse({ message: 'Invalid audio body' }, 400);
        }
      }
    }

    try {
      await handleRequest({ url: path, method, body: requestBody, audioBuffer: audioBuffer }, res);
      return createJsonResponse(responseBody, responseStatus);
    } catch (error) {
      console.error('Server Error:', error);
      return createJsonResponse({ message: 'Internal Server Error' }, 500);
    }
  },
};

// CORS handler
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function handleCors(request: Request): Response {
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Handle CORS preflight requests.
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  } else {
    // Handle simple requests
    return new Response(null, {
      headers: {
        Allow: "GET, POST, OPTIONS",
      },
    });
  }
}

function createJsonResponse(body: any, status = 200): Response {
    const response = new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
        },
    });
    return response;
}

console.log(`Server running on port ${PORT}`);

export default app;