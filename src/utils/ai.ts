import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Session } from '../auth/session';

const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro'
];

export const generateAIContent = async (
  prompt: string,
  modelOverride?: string,
): Promise<string> => {
  const geminiKey = Session.getGeminiKey();
  const openAIKey = Session.getAIKey();

  if (geminiKey) {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const modelsToTry = modelOverride ? [modelOverride] : GEMINI_MODELS;

    for (const modelName of modelsToTry) {
      try {
        console.log(`✨ AI is thinking with Gemini (${modelName})...`);
        const geminiModel = genAI.getGenerativeModel({ model: modelName });
        const result = await geminiModel.generateContent(prompt);
        return result.response.text();
      } catch (error: any) {
        if (error.status === 429 || error.message?.includes('429')) {
          console.warn(`🔄 Rate limit hit for ${modelName}, trying next Gemini model...`);
          continue;
        }
        console.error(`❌ Gemini (${modelName}) Error: ${error.message}`);
        if (!openAIKey) throw error;
      }
    }
    
    if (openAIKey) {
      console.log('🔄 All Gemini models failed or hit quotas, falling back to OpenAI...');
    }
  }

  if (!openAIKey) {
    throw new Error(
      'No AI API Key found. Please type "ai login" and enter an OpenAI (1) or Gemini (2) key.',
    );
  }

  const openai = new OpenAI({ apiKey: openAIKey });

  try {
    const response = await (openai as any).responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
    });

    return (
      response.output_text ||
      response.choices?.[0]?.message?.content ||
      'AI content generation failed'
    );
  } catch (error: any) {
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API Key. Please type "ai login" and enter a fresh key.');
    }
    throw error;
  }
};
