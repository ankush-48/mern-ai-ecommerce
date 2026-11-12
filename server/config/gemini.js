import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set in environment variables.');
}

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : { models: { generateContent: async () => { throw Object.assign(new Error('AI features are not configured yet. Please use keyword search.'), { status: 503 }); } } };

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
export default ai;
