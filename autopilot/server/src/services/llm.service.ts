import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Initialize clients if keys exist
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const groqClient = GROQ_API_KEY ? new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
}) : null;

import { logLLMCall } from './logger.service';

/**
 * Universal LLM Call function with automatic failover (Gemini -> Groq).
 * Supports JSON mode natively where possible.
 */
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 256,
  requireJson: boolean = false
): Promise<string | null> {
  const timestamp = new Date().toISOString();

  // Primary: Gemini
  if (genAI) {
    try {
      // Use 'gemini-1.5-flash' which is the standard model name
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `System Instructions: ${systemPrompt}\n\nUser Input: ${userPrompt}\n\n${requireJson ? 'CRITICAL: YOU MUST RETURN ONLY RAW VALID JSON.' : ''}`;
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.2,
        }
      });
      
      const responseText = result.response.text();
      const cleaned = cleanJsonResponse(responseText, requireJson);
      
      logLLMCall({ service: 'Gemini', systemPrompt, userPrompt, response: cleaned, timestamp });
      return cleaned;
      
    } catch (error: any) {
      console.warn('[LLM] primary (Gemini) failed. Falling back to Groq...', error?.message);
      logLLMCall({ service: 'Gemini', systemPrompt, userPrompt, response: null, error: error?.message, timestamp });
    }
  }

  // Fallback: Groq
  if (groqClient) {
    try {
      const response = await groqClient.chat.completions.create({
        model: 'llama3-70b-8192', // llama-3.3-70b-versatile was removed; using llama3-70b-8192
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt + (requireJson ? '\nCRITICAL: YOU MUST RETURN ONLY RAW VALID JSON.' : '') }
        ],
        max_tokens: maxTokens,
        temperature: 0.2,
        response_format: requireJson ? { type: 'json_object' } : undefined
      });
      
      const content = response.choices[0].message.content;
      const cleaned = content ? cleanJsonResponse(content, requireJson) : null;
      
      logLLMCall({ service: 'Groq', systemPrompt, userPrompt, response: cleaned, timestamp });
      return cleaned;
    } catch (error: any) {
      console.error('[LLM] fallback (Groq) also failed.', error?.message);
      logLLMCall({ service: 'Groq', systemPrompt, userPrompt, response: null, error, timestamp });
      return null;
    }
  }

  if (!genAI && !groqClient) {
    console.warn('[LLM] No API keys configured.');
  }

  // Final Guardrail: If everything failed, return a smart default
  if (requireJson) {
    return JSON.stringify({
      message: "I'm having a bit of trouble reaching my car brain right now. Can you try saying that again?",
      options: ["Tell me about SUVs", "What's good for city?"],
      suggest_shortlist: false,
      confidence_boost: 0
    });
  }

  return "I'm experiencing a momentary connection issue. Let's try again in a second!";
}

// Utility to clean markdown backticks out of strict JSON requirements
function cleanJsonResponse(text: string, isJsonExpected: boolean): string {
  if (!isJsonExpected) return text;
  
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '');
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}
