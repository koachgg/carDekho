import { callLLM } from './llm.service';
import { IntentExtractionResult } from '../types';

const SYSTEM_PROMPT = `You are a car preference extraction engine. Given a user message, extract structured preferences.
Return ONLY valid JSON with these exact keys:
{
  "budget_min_lakh": number | null,
  "budget_max_lakh": number | null,
  "body_types": string[] | null,
  "fuel_types": string[] | null,
  "transmission": string | null,
  "seating_min": number | null,
  "priority": string | null,
  "usage": string | null,
  "tags": string[] | null,
  "confidence_delta": number
}

Valid values:
- body_types: "SUV", "Sedan", "Hatchback", "MUV", "Coupe"
- fuel_types: "Petrol", "Diesel", "CNG", "Electric", "Hybrid"
- transmission: "Automatic" or "Manual" (treat CVT and DCT as "Automatic")
- priority: "mileage", "comfort", "safety", "performance", "value"
- usage: "city", "highway", "family", "adventure"
- confidence_delta: 0-25, how much this single message contributes to knowing the user's needs

Return null for fields you cannot determine. Never guess. Return only JSON, no prose.`;

export async function extractIntent(userMessage: string): Promise<IntentExtractionResult> {
  const response = await callLLM(SYSTEM_PROMPT, userMessage, 512, true);

  if (!response) {
    return getDefaultIntent();
  }

  try {
    // Strip any markdown code block wrapping
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as IntentExtractionResult;
    return {
      budget_min_lakh: parsed.budget_min_lakh ?? null,
      budget_max_lakh: parsed.budget_max_lakh ?? null,
      body_types: parsed.body_types ?? null,
      fuel_types: parsed.fuel_types ?? null,
      transmission: parsed.transmission ?? null,
      seating_min: parsed.seating_min ?? null,
      priority: parsed.priority ?? null,
      usage: parsed.usage ?? null,
      tags: parsed.tags ?? null,
      confidence_delta: parsed.confidence_delta ?? 10,
    };
  } catch (error) {
    console.error('[INTENT] Failed to parse LLM response:', response, error);
    return getDefaultIntent();
  }
}

function getDefaultIntent(): IntentExtractionResult {
  return {
    budget_min_lakh: null,
    budget_max_lakh: null,
    body_types: null,
    fuel_types: null,
    transmission: null,
    seating_min: null,
    priority: null,
    usage: null,
    tags: null,
    confidence_delta: 10,
  };
}
