import 'dotenv/config';
import readline from 'node:readline/promises';
import { Session } from './auth/session';
import { loginWithNotion } from './auth/login';
import { CommandParser } from './commands/parser';
import { createNotionMCPClient } from './mcp/client';
import { createIdea } from './agents/idea';
import { buildStartup } from './agents/startup';
import { researchIdea } from './agents/research';
import { brainstormTopic } from './agents/brainstorm';
import { generateTasks } from './agents/tasks';
import { createPitchDeck } from './agents/investor';
import { generateStories } from './agents/stories';
import { Client } from '@modelcontextprotocol/sdk/client';
import { NotionManager } from './mcp/notion-utils';
import { generateAIContent } from './utils/ai';

const BANNER = `
   _  __     __  _              _____           __            
  / |/ /__  / /_(_)__  ___     / ___/__  ______/ /____ __ __ 
 /    / _ \\/ __/ / _ \\/ _ \\   / /__/ _ \\/ __/ __/ _ \\ \\ /\\ / 
/_/|_/\\___/\\__/_/\\___/_//_/   \\___/\\___/_/  \\__/\\___/_\\_\\_\\_ 
                                                             
        --- The AI-Powered Notion CLI for Startups ---
`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let mcpClient: Client | null = null;

const getClient = async (token: string) => {
  if (mcpClient) return mcpClient;
  console.log('⌛ Connecting to Notion MCP...');
  mcpClient = await createNotionMCPClient(token);

  console.log('🚀 Cortex is online and ready.\n');
  return mcpClient;
};

const main = async () => {
  console.clear();
  console.log(BANNER);

  const initialToken = Session.getToken();
  if (!initialToken) {
    console.log('No active session found. Type "notion login" to begin.');
  } else {
    console.log('✅ Active session restored');
    await getClient(initialToken);
  }

  let isRunning = true;

  process.on('SIGINT', () => {
    isRunning = false;
    rl.close();
    process.exit(0);
  });

  try {
    while (isRunning) {
      const input = await rl.question('cortex > ');
      const trimmedInput = input.trim();
      if (!trimmedInput) continue;

      if (trimmedInput === 'exit' || trimmedInput === 'quit') {
        isRunning = false;
        console.log('Shutting down Cortex...');
        break;
      }

      const command = CommandParser.parse(input);

      try {
        if (command.type === 'login') {
          const token = Session.getToken();
          if (token) {
            console.log('Already logged in to Notion. Type "notion logout" to log out.');
            continue;
          }
          await loginWithNotion(rl);
          const newToken = Session.getToken();
          if (newToken) await getClient(newToken);
          continue;
        }

        if (command.type === 'ai-login') {
          const choice = await rl.question('Which AI model to configure? (1: OpenAI, 2: Gemini): ');
          const key = await rl.question('Enter your API Key: ');
          if (key.trim()) {
            if (choice === '2') {
              Session.saveGeminiKey(key.trim());
              console.log('✅ Gemini API Key saved successfully.\n');
            } else {
              Session.saveAIKey(key.trim());
              console.log('✅ OpenAI API Key saved successfully.\n');
            }
          }
          continue;
        }

        if (command.type === 'logout') {
          Session.deleteToken();
          mcpClient = null;
          console.log('✅ Logged out from Notion. Session cleared.\n');
          continue;
        }

        const token = Session.getToken();
        if (!token) {
          console.log('❌ No active session. Please type "notion login" first.');
          continue;
        }

        const client = await getClient(token);
        const notion = new NotionManager(client);

        switch (command.type) {
          case 'idea':
            console.log(`💡 Saving idea: ${command.value || ''}...`);
            await createIdea(client, command.value || '');
            break;

          case 'build':
            console.log(`🚀 Building workspace for: ${command.value || ''}...`);
            await buildStartup(client, command.value || '');
            break;

          case 'brainstorm':
            console.log(`🧠 Brainstorming for: ${command.value || ''}...`);
            await brainstormTopic(client, command.value || '');
            break;

          case 'tasks':
            console.log(`📋 Drafting tasks for: ${command.value || ''}...`);
            await generateTasks(client, command.value || '');
            break;

          case 'investor':
            console.log(`📊 Pitching for: ${command.value || ''}...`);
            await createPitchDeck(client, command.value || '');
            break;

          case 'stories':
            console.log(`🎭 Developing user stories for: ${command.value || ''}...`);
            await generateStories(client, command.value || '');
            break;

          case 'research':
            console.log(`🔍 Researching topic: ${command.value || ''}...`);
            const researchResult = await researchIdea(command.value || '');
            if (!researchResult || researchResult.length < 50) {
              throw new Error('AI provided insufficient research data.');
            }

            console.log('🚀 Saving Research to Notion...');
            const researchPageId = await notion.createPage({
              title: `Research: ${command.value || ''}`,
              parent: { type: 'workspace', workspace: true },
              icon: '🔍',
            });
            if (!researchPageId) throw new Error('Could not create research page in Notion.');

            await notion.appendLongText(researchPageId, researchResult);
            console.log('✅ Success! Research drafted in Notion.');
            break;

          case 'status':
            console.log('\n📊 Recent Project Pages in Notion:');
            const projectPages = await notion.searchPages();
            if (projectPages.length === 0) {
              console.log('  No pages found.');
            } else {
              projectPages.forEach((p: any) => {
                const title = p.properties.title?.title?.[0]?.plain_text || 'Untitled';
                const date = new Date(p.last_edited_time).toLocaleString();
                console.log(`  - [${p.icon?.emoji || '📄'}] ${title} (Modified: ${date})`);
              });
            }
            console.log(`\n- Connection: Online`);
            console.log(`- Time: ${new Date().toLocaleTimeString()}\n`);
            break;

          case 'help':
            console.log('\n🧠 Cortex CLI - Available Commands:');
            console.log('  notion login     - Authorize your Notion workspace');
            console.log('  notion logout    - Clear your active Notion session');
            console.log('  ai login         - Set your OpenAI or Gemini API key');
            console.log('  build: [topic]   - Build a full 6-page startup workspace');
            console.log('  idea: [topic]    - Save a quick startup concept page');
            console.log('  research: [topic]- Generate a deep market analysis report');
            console.log('  brainstorm: [msg]- Generate 20 fresh project ideas');
            console.log('  tasks: [project] - Inject 10 MVP tasks into an existing page');
            console.log('  stories: [topic] - Generate persona-driven user stories');
            console.log('  investor: [topic]- Draft pitch deck points and "Why Now?" insights');
            console.log('  status           - See recent Notion pages and connection info');
            console.log('  help             - Show this menu');
            console.log('  exit             - Shutdown the CLI\n');
            break;

          case 'unknown':
            console.log(
              `❓ Unknown command: "${trimmedInput}". Try "idea:", "research:", or "build:".`,
            );
            break;
        }
      } catch (error: any) {
        console.error(`❌ Execution error: ${error.message}`);
      }
    }
  } finally {
    rl.close();
  }
};

main().catch((err) => {
  console.error('FATAL SYSTEM ERROR:', err);
  process.exit(1);
});
