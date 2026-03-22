import { Client } from '@modelcontextprotocol/sdk/client';
import { NotionManager } from '../mcp/notion-utils';
import { generateAIContent } from '../utils/ai';

export const generateTasks = async (client: Client, idea: string, parentId?: string) => {
  const notion = new NotionManager(client);
  console.log(`📋 Generating professional roadmap for: ${idea}...`);

  try {
    const prompt = `Generate 10 professional MVP tasks for: "${idea}". 
    Format each task exactly like this on one line:
    [Priority: High/Medium/Low] [Deadline: YYYY-MM-DD] Title - Description
    
    Example:
    [Priority: High] [Deadline: 2026-04-01] Design API Schema - Create a modular schema for the Core engine.`;

    console.log('✨ Drafting structured tasks with AI...');
    const rawContent = await generateAIContent(prompt);

    const lines = rawContent.split('\n').filter((l) => l.includes('[Priority:'));
    if (lines.length === 0) throw new Error('AI failed to generate structured tasks.');

    // 1. Find or Create Database
    const existingDbs = await notion.searchDatabases(`${idea} Roadmap`);
    let dbId = existingDbs.length > 0 ? existingDbs[0].id : null;

    if (!dbId) {
      console.log('🏗️ Creating new Project Roadmap database...');
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

      dbId = await notion.createDatabase(actualParentId, `${idea} Roadmap`);
    }

    console.log(`🔗 Populating roadmap database: ${dbId}...`);
    for (const line of lines) {
      try {
        const priorityMatch = line.match(/\[Priority: (.*?)\]/);
        const deadlineMatch = line.match(/\[Deadline: (.*?)\]/);
        const priority = priorityMatch ? priorityMatch[1] : 'Medium';
        const deadline = deadlineMatch ? deadlineMatch[1] : null;
        const textPart = line.replace(/\[.*?\]/g, '').trim();
        const [name, ...descParts] = textPart.split(' - ');
        const nameClean = name.trim();

        await notion.createDatabasePage(dbId, {
          Name: { title: [{ text: { content: nameClean } }] },
          Priority: { select: { name: priority } },
          Status: { select: { name: 'To Do' } },
          Deadline:
            deadline && deadline.match(/^\d{4}-\d{2}-\d{2}$/)
              ? { date: { start: deadline } }
              : undefined,
        });
      } catch (e) {
        continue;
      }
    }

    console.log('✅ Roadmap successfully created in Notion.');
    return dbId;
  } catch (error: any) {
    console.error('❌ Task generation failed:', error.message || error);
    return null;
  }
};
