import { Client } from '@modelcontextprotocol/sdk/client';
import { NotionManager } from '../mcp/notion-utils';
import { generateAIContent } from '../utils/ai';
import { generateTasks } from './tasks';
import { generateStories } from './stories';

interface StartupSection {
  name: string;
  icon: string;
  descriptionPrompt: string;
}

const setupRootPage = async (notion: NotionManager, idea: string): Promise<string> => {
  const pageId = await notion.createPage({
    title: idea,
    parent: { type: 'workspace', workspace: true },
    icon: '🚀'
  });
  if (!pageId) throw new Error('Root page creation failed.');
  return pageId;
};

const createSubpageWithAIContent = async (
  notion: NotionManager, 
  parentId: string, 
  section: StartupSection
): Promise<void> => {
  const subpageId = await notion.createPage({
    title: section.name,
    parent: { page_id: parentId },
    icon: section.icon
  });

  if (!subpageId) throw new Error(`Subpage ${section.name} creation failed.`);

  const prompt = `${section.descriptionPrompt} Idea: "${parentId}" (Theme: ${section.name}). 
                 Format the output to look like a premium strategy report:
                 - Start with a "[!] TL;DR" callout highlighting the most critical takeaway.
                 - Use "###" for clearly titled sub-sections.
                 - Use "> " for important founder-proverbs or strategic quotes.
                 - Use "**" for key bold terms.
                 Target deep, actionable startup planning.`;
  
  const content = await generateAIContent(prompt);
  if (!content || content.length < 50) {
    throw new Error(`AI generated insufficient content for ${section.name}`);
  }
  await notion.appendLongText(subpageId, content);
};

const getStartupSections = (idea: string): StartupSection[] => [
  { 
    name: 'Core Concept', 
    icon: '💡', 
    descriptionPrompt: `Draft a deep dive into the business model and value proposition for: ${idea}.` 
  },
  { 
    name: 'Market Analysis', 
    icon: '🔍', 
    descriptionPrompt: `Provide estimated market size, current trends, and target customer segments for a startup focused on: ${idea}.` 
  },
  { 
    name: 'Competitor Landscape', 
    icon: '⚔️', 
    descriptionPrompt: `Identify potential competitors for ${idea} and outline where the gaps are in their current offerings.` 
  },
  { 
    name: 'Product Roadmap & MVP', 
    icon: '✨', 
    descriptionPrompt: `Construct an MVP development timeline for ${idea}, prioritizing features from highest to lowest impact.` 
  },
  { 
    name: 'Tasks & Milestones', 
    icon: '📋', 
    descriptionPrompt: '' // Special casehandled in loop
  }
];

const processError = (error: any): void => {
  console.error(`\n❌ ERROR: System encountered a block while building.`);
  console.error(`  - Message: ${error.message || 'Unknown server error'}`);
};

export const buildStartup = async (client: Client, idea: string) => {
  const notion = new NotionManager(client);
  console.log(`🚀 Launching startup workspace build for: ${idea}...`);

  try {
    const rootPageId = await setupRootPage(notion, idea);
    console.log(`✅ Root workspace established: ${rootPageId}`);

    const sections = getStartupSections(idea);
    for (const section of sections) {
      console.log(`  - Drafting ${section.name}...`);
      if (section.name === 'Tasks & Milestones') {
        // This section is now handled separately after the loop
      } else {
        await createSubpageWithAIContent(notion, rootPageId, section);
      }
    }

    console.log('  - Creating professional Tasks Database...');
    await generateTasks(client, idea, rootPageId);

    console.log('  - Creating User Stories Database...');
    await generateStories(client, idea, rootPageId);

    console.log('\n🌟 SUCCESS: Your modular startup workspace is fully built with structured strategy pages, Roadmap, and User Stories Databases!');
  } catch (error: any) {
    processError(error);
  }
};
