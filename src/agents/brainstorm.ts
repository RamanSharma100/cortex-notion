import { Client } from '@modelcontextprotocol/sdk/client';
import { NotionManager } from '../mcp/notion-utils';
import { generateAIContent } from '../utils/ai';

export const brainstormTopic = async (client: Client, topic: string) => {
  const notion = new NotionManager(client);
  console.log(`🧠 Brainstorming 20 startup ideas for: ${topic}...`);

  try {
    const prompt = `Generate exactly 20 unique and innovative startup ideas related to: "${topic}". 
    Format each idea as a short, catchy title followed by a one-sentence hook.
    Separate each idea with a newline.`;

    console.log('✨ AI is brainstorming...');
    const content = await generateAIContent(prompt);
    const ideas = content.split('\n').filter((i) => i.trim() !== '');

    if (ideas.length === 0) {
      throw new Error('AI could not generate any ideas. Check your prompt or API status.');
    }

    console.log('🚀 Creating Brainstorming page in Notion...');
    const pageId = await notion.createPage({
      title: `${topic}`,
      parent: { type: 'workspace', workspace: true },
      icon: '🧠',
    });

    await notion.appendBulletedList(pageId, ideas);

    console.log(`✅ Success! 20 ideas for "${topic}" are now live in Notion.`);
  } catch (error: any) {
    console.error('❌ Brainstorming failed:', error.message || error);
  }
};
