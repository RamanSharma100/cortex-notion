import { Client } from '@modelcontextprotocol/sdk/client';
import { NotionManager } from '../mcp/notion-utils';
import { generateAIContent } from '../utils/ai';

export const generateTasks = async (client: Client, idea: string, parentId?: string) => {
  const notion = new NotionManager(client);
  console.log(`📋 Generating professional roadmap for: ${idea}...`);

  try {
    const prompt = `Generate 10 professional MVP tasks for: "${idea}". 
    Present them in a Markdown Table with these columns:
    | Priority | Deadline | Task Name | Description |`;

    console.log('✨ Drafting structured roadmap with AI...');
    const content = await generateAIContent(prompt);

    if (!content || !content.includes('|')) {
      throw new Error('AI failed to generate a structured roadmap table.');
    }

    const actualParentId = parentId || (await (async () => {
      const pages = await notion.searchPages(idea);
      const rootPage = pages.find(p => p.icon?.emoji === '🚀' || p.icon?.emoji === '💡');
      return rootPage ? rootPage.id : (await notion.createPage({
        title: idea,
        parent: { type: 'workspace', workspace: true },
        icon: '🚀'
      }));
    })());

    console.log('🏗️ Creating Roadmap page...');
    const pageId = await notion.createPage({
      title: `${idea} Roadmap`,
      parent: { page_id: actualParentId },
      icon: '📋'
    });

    await notion.appendLongText(pageId, content);

    console.log('✅ Roadmap successfully created in Notion.');
    return pageId;
  } catch (error: any) {
    console.error('❌ Task generation failed:', error.message || error);
    return null;
  }
};
