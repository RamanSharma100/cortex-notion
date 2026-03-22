import { generateAIContent } from '../utils/ai';

export const researchIdea = async (topic: string): Promise<string> => {
  const prompt = `Perform a deep dive market research on the following topic: "${topic}". 
  Include:
  1. Market Size & Growth Potential
  2. Main Competitors
  3. Key Barriers to Entry
  4. Strategic Recommendations
  
  Format this as a detailed professional report.`;

  return await generateAIContent(prompt);
};
