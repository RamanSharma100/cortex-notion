import { Client } from '@modelcontextprotocol/sdk/client';
import { NotionManager } from '../mcp/notion-utils';
import { generateAIContent } from '../utils/ai';

interface StartupSection {
  name: string;
  icon: string;
  descriptionPrompt: string;
}

const setupRootPage = async (notion: NotionManager, idea: string): Promise<string> => {
  const pageId = await notion.createPage({
    title: `Project: ${idea}`,
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
                 Target at least 2 key paragraphs of actionable startup planning.`;
  
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
    descriptionPrompt: `Create a list of the first 5 actionable steps to launch ${idea} from scratch.` 
  }
];

const processError = (error: any): void => {
  console.error(`\n❌ ERROR: System encountered a block while building.`);
  console.error(`  - Message: ${error.message || 'Unknown server error'}`);
  if (error.response?.data) {
    console.error(`  - API Response: ${JSON.stringify(error.response.data)}`);
  }
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
      await createSubpageWithAIContent(notion, rootPageId, section);
    }

    console.log('\n🌟 SUCCESS: Your modular startup workspace is fully built and AI-populated!');
  } catch (error: any) {
    processError(error);
  }
};
