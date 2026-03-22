import { Client } from '@modelcontextprotocol/sdk/client';
import { NotionManager } from '../mcp/notion-utils';
import { generateAIContent } from '../utils/ai';

export const createIdea = async (client: Client, idea: string) => {
  const notion = new NotionManager(client);
  console.log(`💡 Processing idea: ${idea}...`);

  try {
    const prompt = `Write a compelling 2-3 paragraph description for a startup idea: "${idea}". 
    Focus on the problem it solves, the unique value proposition, and the target audience. 
    Make it professional and inspiring.`;

    console.log('✨ Generating AI content...');
    const content = await generateAIContent(prompt);

    if (!content || content.length < 10) {
      throw new Error('AI produced insufficient or empty content.');
    }

    console.log('🚀 Creating Notion page...');
    const pageId = await notion.createPage({
      title: `Idea: ${idea}`,
      parent: { type: 'workspace', workspace: true },
      icon: '💡',
    });

    await notion.appendLongText(pageId, content);

    console.log('✅ Idea saved to Notion with AI-generated content.');
  } catch (error: any) {
    console.error('❌ Failed to save idea to Notion:', error.message || error);
  }
};
