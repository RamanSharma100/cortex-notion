import { Client } from '@modelcontextprotocol/sdk/client';
import { NotionManager } from '../mcp/notion-utils';
import { generateAIContent } from '../utils/ai';

export const generateStories = async (client: Client, idea: string, parentId?: string) => {
  const notion = new NotionManager(client);
  console.log(`🎭 Generating User Stories for: ${idea}...`);

  try {
    const prompt = `Generate 10 high-impact user stories for a startup: "${idea}". 
    Present them in a Markdown Table with these columns:
    | Persona | User Story | Business Value |`;

    console.log('✨ Drafting stories with AI...');
    const content = await generateAIContent(prompt);

    if (!content || !content.includes('|')) {
      throw new Error('AI failed to generate a structured stories table.');
    }

    // Find or Create Parent
    const actualParentId = parentId || (await (async () => {
      const pages = await notion.searchPages(idea);
      const rootPage = pages.find(p => p.icon?.emoji === '🚀' || p.icon?.emoji === '💡');
      return rootPage ? rootPage.id : (await notion.createPage({
        title: idea,
        parent: { type: 'workspace', workspace: true },
        icon: '🚀'
      }));
    })());

    console.log('🏗️ Creating User Stories page...');
    const pageId = await notion.createPage({
      title: `${idea} User Stories`,
      parent: { page_id: actualParentId },
      icon: '🎭'
    });

    await notion.appendLongText(pageId, content);

    console.log('✅ User Stories successfully created in Notion.');
    return pageId;
  } catch (error: any) {
    console.error('❌ Story generation failed:', error.message || error);
    return null;
  }
};
