import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Session } from '../auth/session';

export const generateAIContent = async (
  prompt: string,
  model: string = 'gemini-3-flash-preview',
): Promise<string> => {
  const geminiKey = Session.getGeminiKey();
  const openAIKey = Session.getAIKey();

  // Prioritize Gemini for "Free Tier" request
  if (geminiKey) {
    try {
      console.log('✨ AI is thinking with Gemini...');
      const genAI = new GoogleGenerativeAI(geminiKey);
      const geminiModel = genAI.getGenerativeModel({ model: model });
      const result = await geminiModel.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.error('❌ Gemini Error:', error.message);
      // Fallback only if model is default and OpenAI is present
      if (!openAIKey) throw error;
      console.log('🔄 Gemini failed, falling back to OpenAI...');
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
      model: 'gpt-4.1-mini', // or the user's default
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
