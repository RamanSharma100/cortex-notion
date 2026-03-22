import { Client } from '@modelcontextprotocol/sdk/client';
import { NotionManager } from '../mcp/notion-utils';
import { generateAIContent } from '../utils/ai';

export const createPitchDeck = async (client: Client, idea: string) => {
  const notion = new NotionManager(client);
  console.log(`📊 Drafting pitch deck for: ${idea}...`);

  try {
    const prompt = `Create high-impact pitch deck points for a startup idea: "${idea}". 
    Focus on the "Why Now?", the "Killer Metric," the competitive advantage, and the scalability.
    Ensure sections are well-defined for an investor presentation.`;
    
    console.log('✨ Generating pitch deck insights with AI...');
    const content = await generateAIContent(prompt);
    
    if (!content || content.length < 50) {
      throw new Error('AI produced insufficient pitch deck content.');
    }

    // Create new Pitch Deck page
    console.log('🚀 Creating Investor Pitch page...');
    const pageId = await notion.createPage({
      title: `Pitch Deck: ${idea}`,
      parent: { type: 'workspace', workspace: true },
      icon: '🏛️'
    });

    if (!pageId) throw new Error('Could not create pitch deck page in Notion.');
    
    await notion.appendLongText(pageId, content);

    console.log(`✅ Success! Pitch deck points for "${idea}" are live in Notion.`);
  } catch (error: any) {
    console.error('❌ Investor pitch generation failed:', error.message || error);
  }
};
