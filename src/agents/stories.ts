import { Client } from '@modelcontextprotocol/sdk/client';
import { NotionManager } from '../mcp/notion-utils';
import { generateAIContent } from '../utils/ai';

export const generateStories = async (client: Client, idea: string, parentId?: string) => {
  const notion = new NotionManager(client);
  console.log(`🎭 Generating User Stories for: ${idea}...`);

  try {
    const prompt = `Generate 10 high-impact user stories for a startup: "${idea}". 
    Format each story exactly on one line:
    Persona - Story - Business Value
    
    Example:
    Founder - As a founder, I want to track my runway so that I don't go broke. - Financial Control`;

    console.log('✨ Drafting stories with AI...');
    const rawContent = await generateAIContent(prompt);
    const lines = rawContent.split('\n').filter((l) => l.includes(' - '));

    if (lines.length === 0) throw new Error('AI failed to generate structured stories.');

    const actualParentId =
      parentId ||
      (await (async () => {
        const pages = await notion.searchPages(idea);
        const rootPage = pages.find((p) => p.icon?.emoji === '🚀' || p.icon?.emoji === '💡');
        return rootPage
          ? rootPage.id
          : await notion.createPage({
              title: idea,
              parent: { type: 'workspace', workspace: true },
              icon: '🚀',
            });
      })());

    console.log('🏗️ Creating User Stories database...');

    const result = await client.callTool({
      name: 'API-post-database',
      arguments: {
        parent: { type: 'page_id', page_id: actualParentId },
        title: [{ type: 'text', text: { content: `${idea} User Stories` } }],
        properties: {
          Story: { title: {} },
          Persona: { select: { options: [] } },
          'Business Value': { rich_text: {} },
        },
      },
    });

    const dbId = (notion as any).extractId(result);

    console.log(`🔗 Populating stories database: ${dbId}...`);
    for (const line of lines) {
      try {
        const [persona, story, value] = line.split(' - ');
        await notion.createDatabasePage(dbId, {
          Story: { title: [{ text: { content: story.trim() } }] },
          Persona: { select: { name: persona.trim() } },
          'Business Value': { rich_text: [{ text: { content: value.trim() } }] },
        });
      } catch (e) {
        continue;
      }
    }

    console.log('✅ User Stories successfully created in Notion.');
    return dbId;
  } catch (error: any) {
    console.error('❌ Story generation failed:', error.message || error);
    return null;
  }
};
