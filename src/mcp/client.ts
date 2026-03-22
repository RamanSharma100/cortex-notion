import { Client } from '@modelcontextprotocol/sdk/client';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export const createNotionMCPClient = async (token: string): Promise<Client> => {
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['@notionhq/notion-mcp-server'],
    env: {
      OPENAPI_MCP_HEADERS: JSON.stringify({
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
      }),
    },
  });

  const client = new Client(
    { name: 'notion-cortex', version: '1.0.0' },
    { capabilities: {} },
  );

  try {
    await client.connect(transport);
  } catch (error: any) {
    throw new Error(`Notion Connector Failed: ${error.message}. Please check your internet or if "npx" is available.`);
  }

  return client;
};
