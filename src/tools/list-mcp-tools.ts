import 'dotenv/config';
import { Session } from '../auth/session';
import { createNotionMCPClient } from '../mcp/client';

const listTools = async () => {
  const token = Session.getToken();
  if (!token) {
    console.error('No token found');
    return;
  }

  const client = await createNotionMCPClient(token);
  const tools = await client.listTools();
  console.log(JSON.stringify(tools, null, 2));
  process.exit(0);
};

listTools();
