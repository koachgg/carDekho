import { queryAll } from '../db/database';
import { Car, PreferenceVector, ScoredCar } from '../types';
import { scoreCar } from './scoring.service';
import { cache, TTL } from './cache.service';
import { callLLM } from './llm.service';

export async function getRecommendations(prefs: PreferenceVector, limit: number = 3, skipAiReason: boolean = false): Promise<ScoredCar[]> {
  const cacheKey = `recs:${JSON.stringify(prefs)}:${limit}:${skipAiReason}`;
  const cached = cache.get<ScoredCar[]>(cacheKey);
  if (cached) return cached;

  const allCars = await queryAll<Car>(`
    SELECT c.*, v.price_lakh, v.fuel_type, v.transmission, v.mileage_kmpl, v.engine_cc, v.power_bhp, v.torque_nm, v.boot_liters, v.running_cost_per_km, v.variant_name as variant
    FROM cars c
    JOIN variants v ON c.id = v.car_id
  `);

  let scored: ScoredCar[] = allCars
    .map((car) => ({
      ...car,
      score: scoreCar(car, prefs),
      reason: generateReason(car, prefs), // base fallback
    }))
    .filter((car) => car.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Upgrade reasoning to AI specifically for the shortlist (takes ~1-2s)
  if (!skipAiReason && scored.length > 0) {
    const carList = scored.map(c => `${c.make} ${c.model} (Score: ${c.score}%)`).join(', ');
    const systemPrompt = "You are an expert car advisor. Explain briefly why these specific cars are excellent choices for the user's preferences.";
    const userPrompt = `User preferences: ${JSON.stringify(prefs)}. \nCars shortlisted: ${carList}. \nOutput JSON with exact key 'reasons' containing a map of "{make} {model}" to a 1-2 sentence personalized reason.`;
    
    try {
      const llmResult = await callLLM(systemPrompt, userPrompt, 512, true);
      if (llmResult) {
        const parsed = JSON.parse(llmResult) as { reasons?: Record<string, string> };
        if (parsed.reasons) {
          scored = scored.map(car => {
            const key = `${car.make} ${car.model}`;
            if (parsed.reasons![key]) {
              car.reason = parsed.reasons![key];
            }
            return car;
          });
        }
      }
    } catch (err) {
      console.warn('[RECOMMEND] Failed to generate AI reasons, falling back to deterministic.');
    }
  }

  cache.set(cacheKey, scored, TTL.RECOMMENDATIONS);
  return scored;
}

export async function getTopMatch(prefs: PreferenceVector): Promise<ScoredCar | null> {
  const recs = await getRecommendations(prefs, 1, true); // skip full AI for quick top match lookup during chat
  return recs[0] || null;
}

function generateReason(car: Car, prefs: PreferenceVector): string {
  const reasons: string[] = [];

  if (prefs.priority === 'mileage' && car.mileage_kmpl && car.mileage_kmpl > 18) {
    reasons.push(`delivers ${car.mileage_kmpl} km/l — among the best in segment`);
  }
  if (prefs.priority === 'safety' && car.safety_rating && car.safety_rating >= 4) {
    reasons.push(`rated ${car.safety_rating}/5 stars in safety`);
  }
  if (prefs.priority === 'value' && car.price_lakh < 10) {
    reasons.push(`priced at just ${car.price_lakh}L — strong value proposition`);
  }
  if (prefs.priority === 'comfort' && car.boot_liters && car.boot_liters > 400) {
    reasons.push(`offers ${car.boot_liters}L boot — best-in-class space`);
  }
  if (prefs.priority === 'performance' && car.power_bhp && car.power_bhp > 100) {
    reasons.push(`packs ${car.power_bhp} bhp for an engaging drive`);
  }

  if (prefs.usage) {
    try {
      const tags = car.tags ? (typeof car.tags === 'string' ? JSON.parse(car.tags) : car.tags) : [];
      if (Array.isArray(tags) && tags.includes(prefs.usage)) {
        reasons.push(`well-suited for ${prefs.usage} use`);
      }
    } catch { /* ignore */ }
  }

  if (prefs.budget_max_lakh && car.price_lakh <= prefs.budget_max_lakh * 0.85) {
    reasons.push(`sits comfortably within your budget`);
  }

  if (reasons.length === 0) {
    reasons.push(`strong overall match for your preferences`);
  }

  const make = `${car.make} ${car.model}`;
  return `The ${make} ${reasons.slice(0, 2).join(' and ')}.`;
}
