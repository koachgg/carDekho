import { Request, Response } from 'express';
import { queryAll, queryOne, execute } from '../db/database';
import { Session, PreferenceVector, ChatMessage } from '../types';
import { extractIntent } from '../services/intent.service';
import { getTopMatch } from '../services/recommendation.service';
import { callLLM } from '../services/llm.service';

const CHAT_SYSTEM_PROMPT = `You are "AutoPilot", a charismatic and deeply knowledgeable car advisor — think of yourself as a mix between a trusted friend who loves cars and a premium dealership concierge. You speak casually but with authority.

PERSONALITY:
- Warm, witty, and enthusiastic about cars
- Use casual language ("Hey!", "Awesome choice!", "Oh interesting...")
- Sprinkle in real car knowledge and comparisons naturally
- Keep responses SHORT: 1-2 sentences max for questions, 2-3 for recommendations
- Never sound robotic or transactional
- Use emojis sparingly but naturally (1 max per message)

CURRENT USER PREFERENCES: {{prefs}}
RECENT CONVERSATION: {{history}}

YOUR STRATEGY:
- If this is the FIRST message (empty history), greet warmly and ask about their lifestyle/needs, NOT technical specs
- Gather info naturally: budget range, what they'll use it for, who rides with them, city or highway
- Don't rapid-fire questions. React to what they say, share a micro-insight, THEN ask the next thing
- If they mention a car brand/model, acknowledge it and explore WHY they like it
- When you have budget + use-case + at least 1 more preference, start suggesting
- If they push back on a suggestion, LISTEN and adjust — don't repeat yourself

RESPONSE FORMAT (strict JSON):
{
  "message": "Your conversational response here",
  "options": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "suggest_shortlist": false,
  "confidence_boost": 10
}

RULES FOR OPTIONS:
- Options should feel like natural conversation choices, not form fields
- Good: ["Under 10 Lakh", "10-20 Lakh", "Budget is flexible"]
- Bad: ["Budget?", "Fuel Type?", "Safety?"]
- Max 3 options, they should help the user express intent quickly
- If confidence is getting high (user gave 3+ preferences), set suggest_shortlist to true

confidence_boost guide: greeting=5, each real preference extracted=15, casual chat=5, objection/question=5
`;

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const { sessionId } = req.params;
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: { message: 'Message is required' } });
    return;
  }

  const session = await queryOne<Session>('SELECT * FROM sessions WHERE id = ?', [sessionId]);
  if (!session) {
    res.status(404).json({ error: { message: 'Session not found' } });
    return;
  }

  const prefs: PreferenceVector = session.preference_vector
    ? (typeof session.preference_vector === 'string' ? JSON.parse(session.preference_vector) : session.preference_vector)
    : getEmptyPrefs();
  const history: ChatMessage[] = session.conversation_history
    ? (typeof session.conversation_history === 'string' ? JSON.parse(session.conversation_history) : session.conversation_history)
    : [];

  // Add user message to history
  history.push({ role: 'user', content: message });

  // Extract intent from user message
  const intent = await extractIntent(message);

  // Merge extracted preferences (only non-null values)
  const merged = mergePreferences(prefs, intent);

  // Calculate new confidence
  let confidence = Math.min(100, (session.confidence_score || 0) + intent.confidence_delta);

  // Use LLM to decide the next conversational step
  const systemPrompt = CHAT_SYSTEM_PROMPT
    .replace('{{prefs}}', JSON.stringify(merged))
    .replace('{{history}}', JSON.stringify(history.slice(-5)));

  const botDecisionRaw = await callLLM(systemPrompt, message, 512, true);
  let decision: { message: string; options: string[]; suggest_shortlist: boolean; confidence_boost: number };
  
  try {
    decision = JSON.parse(botDecisionRaw || '{}');
  } catch (e) {
    decision = {
      message: "That's helpful! Tell me more about what you're looking for.",
      options: ['Budget?', 'Fuel Type?', 'Safety?'],
      suggest_shortlist: false,
      confidence_boost: 5
    };
  }

  let assistantMessage: ChatMessage;

  // Update confidence
  confidence = Math.min(100, confidence + (decision.confidence_boost || 0));
  
  // If suggest_shortlist is true, ensure they get the button
  const options = [...(decision.options || [])];
  if (decision.suggest_shortlist || confidence >= 85) {
    if (!options.includes('See my shortlist')) options.push('See my shortlist');
  }

  assistantMessage = {
    role: 'assistant',
    content: decision.message || "I'm listening! Tell me more about your requirements.",
    options: options.slice(0, 4), // Limit buttons
  };

  history.push(assistantMessage);

  // Persist
  await execute(
    'UPDATE sessions SET preference_vector = ?, conversation_history = ?, confidence_score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [JSON.stringify(merged), JSON.stringify(history), confidence, sessionId]
  );

  // Get top match for panel
  const topMatch = await getTopMatch(merged);

  res.json({
    message: assistantMessage,
    preference_vector: merged,
    confidence_score: confidence,
    top_match: topMatch,
    conversation_history: history,
  });
}

function mergePreferences(existing: PreferenceVector, extracted: Partial<PreferenceVector>): PreferenceVector {
  return {
    budget_min_lakh: extracted.budget_min_lakh ?? existing.budget_min_lakh,
    budget_max_lakh: extracted.budget_max_lakh ?? existing.budget_max_lakh,
    body_types: extracted.body_types ?? existing.body_types,
    fuel_types: extracted.fuel_types ?? existing.fuel_types,
    transmission: extracted.transmission ?? existing.transmission,
    seating_min: extracted.seating_min ?? existing.seating_min,
    priority: extracted.priority ?? existing.priority,
    usage: extracted.usage ?? existing.usage,
    tags: extracted.tags ?? existing.tags,
  };
}

function getEmptyPrefs(): PreferenceVector {
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
  };
}
