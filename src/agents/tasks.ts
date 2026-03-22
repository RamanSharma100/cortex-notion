import { Client } from '@modelcontextprotocol/sdk/client';
import { NotionManager } from '../mcp/notion-utils';
import { generateAIContent } from '../utils/ai';

export const generateTasks = async (client: Client, idea: string) => {
  const notion = new NotionManager(client);
  console.log(`📋 Generating MVP tasks for: ${idea}...`);

  try {
    const prompt = `Generate 10 concrete, actionable tasks for building an MVP for: "${idea}". 
    Focus on developer work, marketing, and the primary user goal. 
    Ensure tasks are specific and actionable.`;
    
    console.log('✨ Drafting tasks with AI...');
    const content = await generateAIContent(prompt);

    if (!content || content.length < 50) {
      throw new Error('AI failed to generate actionable tasks. Try a more specific idea.');
    }
    
    // Search for existing Project page if any
    const pages = await notion.searchPages(idea);
    const targetPage = pages.find(p => p.icon?.emoji === '🚀' || p.icon?.emoji === '💡');
    
    if (targetPage) {
      console.log(`🔗 Appending tasks to existing page: ${targetPage.id}...`);
      await notion.appendParagraph(targetPage.id, '--- MVP TASKS ---');
      await notion.appendLongText(targetPage.id, content);
    } else {
      console.log('🚀 Creating new Tasks page...');
      const pageId = await notion.createPage({
        title: `Tasks: ${idea}`,
        parent: { type: 'workspace', workspace: true },
        icon: '📋'
      });
      await notion.appendLongText(pageId, content);
    }

    console.log('✅ Tasks successfully added to Notion.');
  } catch (error: any) {
    console.error('❌ Task generation failed:', error.message || error);
  }
};
