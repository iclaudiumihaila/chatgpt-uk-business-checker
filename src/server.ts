/**
 * UK Business Due Diligence Checker - MCP Server
 * ChatGPT App for verifying UK businesses using Companies House API
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';

import { CompaniesHouseClient } from './utils/companiesHouseClient.js';
import { SearchInputSchema, handleSearch } from './tools/searchTool.js';
import { VerifyInputSchema, handleVerify } from './tools/verifyTool.js';

// Get current directory (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Companies House API client
const COMPANIES_HOUSE_API_KEY = process.env.COMPANIES_HOUSE_API_KEY;

if (!COMPANIES_HOUSE_API_KEY) {
  console.error('❌ ERROR: COMPANIES_HOUSE_API_KEY environment variable is required');
  console.error('   Set it in your shell or .env file');
  process.exit(1);
}

const companiesHouseClient = new CompaniesHouseClient(COMPANIES_HOUSE_API_KEY);

// Create MCP Server
const server = new Server(
  {
    name: 'uk-business-checker',
    version: '1.0.0'
  },
  {
    capabilities: {
      resources: {},
      tools: {}
    }
  }
);

// ===== REGISTER WIDGET RESOURCES =====

// List available widgets
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'ui://widget/search-carousel.html',
        name: 'UK Business Search Results',
        description: 'Displays search results in a carousel format',
        mimeType: 'text/html+skybridge'
      },
      {
        uri: 'ui://widget/company-card.html',
        name: 'UK Business Verification Card',
        description: 'Shows company verification with trust score',
        mimeType: 'text/html+skybridge'
      }
    ]
  };
});

// Read widget content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  try {
    let widgetPath: string;

    if (uri === 'ui://widget/search-carousel.html') {
      widgetPath = join(__dirname, '../public/search-carousel.html');
    } else if (uri === 'ui://widget/company-card.html') {
      widgetPath = join(__dirname, '../public/company-card.html');
    } else {
      throw new Error(`Unknown widget URI: ${uri}`);
    }

    const widgetContent = readFileSync(widgetPath, 'utf-8');

    return {
      contents: [{
        uri,
        mimeType: 'text/html+skybridge',
        text: widgetContent
      }]
    };
  } catch (error) {
    console.error(`Failed to load widget ${uri}:`, error);
    throw error;
  }
});

// ===== REGISTER TOOLS =====

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_uk_business',
        description: 'Search for UK companies by name. Use when user wants to find a company, verify a business name, or check if a company exists. Returns top 5 matches with basic information.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Company name or partial name to search for'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'verify_uk_business',
        description: 'Perform comprehensive due diligence on a UK business. Analyzes company status, financial health, director information, and provides trust score (0-100) with risk assessment. Use when user wants to verify legitimacy, check trustworthiness, or do due diligence.',
        inputSchema: {
          type: 'object',
          properties: {
            company_number: {
              type: 'string',
              description: "UK Companies House registration number (8 digits, e.g., '12345678')"
            }
          },
          required: ['company_number']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments as Record<string, unknown>;

  try {
    if (toolName === 'search_uk_business') {
      const input = SearchInputSchema.parse(args);
      return await handleSearch(input, companiesHouseClient);
    } else if (toolName === 'verify_uk_business') {
      const input = VerifyInputSchema.parse(args);
      return await handleVerify(input, companiesHouseClient);
    } else {
      throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error(`Tool execution error (${toolName}):`, error);

    // Return error as tool response
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
});

// ===== HTTP SERVER SETUP =====

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8787;

// Map to track SSE transports by session ID
const transports = new Map<string, SSEServerTransport>();

// Create HTTP server with SSE transport
const httpServer = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      app: 'UK Business Due Diligence Checker',
      version: '1.0.0',
      mcp_endpoint: '/mcp'
    }));
    return;
  }

  // MCP SSE endpoint (GET - establish SSE connection)
  if (req.url === '/mcp' && req.method === 'GET') {
    const transport = new SSEServerTransport('/mcp/messages', res);
    transports.set(transport.sessionId, transport);

    transport.onclose = () => {
      transports.delete(transport.sessionId);
    };

    await server.connect(transport);
    return;
  }

  // MCP POST endpoint (POST - receive messages)
  if (req.url?.startsWith('/mcp/messages') && req.method === 'POST') {
    // Extract session ID from URL
    const urlParts = req.url.split('/');
    const sessionId = urlParts[urlParts.length - 1];

    const transport = transports.get(sessionId);
    if (transport) {
      await transport.handlePostMessage(req, res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session not found' }));
      return;
    }
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
httpServer.listen(PORT, () => {
  console.log('🚀 UK Business Due Diligence Checker - MCP Server');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔗 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log('');
  console.log('💡 To use in ChatGPT:');
  console.log('   1. Enable Developer Mode in ChatGPT Settings');
  console.log('   2. Add connector with your public URL (use ngrok for local dev)');
  console.log('   3. Example: ngrok http 8787');
  console.log('');
  console.log('✅ Ready to verify UK businesses!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
