import { Client } from '@modelcontextprotocol/sdk/client';
import { NotionManager } from '../mcp/notion-utils';
import { generateAIContent } from '../utils/ai';

export const createIdea = async (client: Client, idea: string) => {
  const notion = new NotionManager(client);
  console.log(`💡 Processing idea: ${idea}...`);

  try {
    const prompt = `Write a professional briefing for the startup idea: "${idea}". 
    Format it as a premium strategy document:
    - Start with a "[!] Summary" callout highlighting the core innovation.
    - Use "###" for clear sections: Problem, Solution, Moat.
    - Use "> " for the unique "Moat" or competitive advantage.
    - End with a list of 5 "Immediate Next Steps".
    Make it compelling, actionable, and ready for a pitch deck.`;

    console.log('✨ Generating AI content...');
    const content = await generateAIContent(prompt);

    if (!content || content.length < 10) {
      throw new Error('AI produced insufficient or empty content.');
    }

    console.log('🚀 Creating Notion page...');
    const pageId = await notion.createPage({
      title: `${idea}`,
      parent: { type: 'workspace', workspace: true },
      icon: '💡',
    });

    await notion.appendLongText(pageId, content);

    console.log('✅ Idea saved to Notion with AI-generated content.');
  } catch (error: any) {
    console.error('❌ Failed to save idea to Notion:', error.message || error);
  }
};
