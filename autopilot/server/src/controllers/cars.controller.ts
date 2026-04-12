import { Request, Response } from 'express';
import { queryAll, queryOne } from '../db/database';
import { Car, PreferenceVector, Session } from '../types';
import { getRecommendations } from '../services/recommendation.service';
import { callLLM } from '../services/llm.service';
import { cache, TTL } from '../services/cache.service';

export async function search(req: Request, res: Response): Promise<void> {
  const { fuel_type, body_type, transmission, min_price, max_price, min_safety } = req.query;

  let sql = 'SELECT * FROM cars WHERE 1=1';
  const params: unknown[] = [];

  if (fuel_type) { sql += ' AND fuel_type = ?'; params.push(fuel_type); }
  if (body_type) { sql += ' AND body_type = ?'; params.push(body_type); }
  if (transmission) { sql += ' AND transmission = ?'; params.push(transmission); }
  if (min_price) { sql += ' AND price_lakh >= ?'; params.push(Number(min_price)); }
  if (max_price) { sql += ' AND price_lakh <= ?'; params.push(Number(max_price)); }
  if (min_safety) { sql += ' AND safety_rating >= ?'; params.push(Number(min_safety)); }

  sql += ' ORDER BY price_lakh ASC';

  const cars = await queryAll<Car>(sql, params);
  res.json(cars);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const car = await queryOne<Car>('SELECT * FROM cars WHERE id = ?', [Number(req.params.id)]);

  if (!car) {
    res.status(404).json({ error: { message: 'Car not found' } });
    return;
  }

  res.json(car);
}

export async function recommend(req: Request, res: Response): Promise<void> {
  const { preference_vector, sessionId } = req.body;

  let prefs: PreferenceVector;

  if (preference_vector) {
    prefs = preference_vector;
  } else if (sessionId) {
    const session = await queryOne<Session>('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!session || !session.preference_vector) {
      res.status(400).json({ error: { message: 'No preferences found for session' } });
      return;
    }
    prefs = typeof session.preference_vector === 'string' ? JSON.parse(session.preference_vector) : session.preference_vector;
  } else {
    res.status(400).json({ error: { message: 'preference_vector or sessionId required' } });
    return;
  }

  const recommendations = await getRecommendations(prefs, 3);
  res.json(recommendations);
}

export async function compare(req: Request, res: Response): Promise<void> {
  const { carIds, sessionId } = req.body;

  if (!carIds || !Array.isArray(carIds) || carIds.length < 2) {
    res.status(400).json({ error: { message: 'At least 2 carIds required' } });
    return;
  }

  const cars = await queryAll<Car>(
    `SELECT * FROM cars WHERE id IN (${carIds.map(() => '?').join(',')})`,
    carIds
  );

  if (cars.length < 2) {
    res.status(404).json({ error: { message: 'Cars not found' } });
    return;
  }

  // Build spec comparison
  const specs: Record<string, (string | number | null)[]> = {
    'Price': cars.map((c) => c.price_lakh),
    'Fuel Type': cars.map((c) => c.fuel_type),
    'Transmission': cars.map((c) => c.transmission),
    'Engine (cc)': cars.map((c) => c.engine_cc),
    'Power (bhp)': cars.map((c) => c.power_bhp),
    'Torque (Nm)': cars.map((c) => c.torque_nm),
    'Mileage (km/l)': cars.map((c) => c.mileage_kmpl),
    'Boot Space (L)': cars.map((c) => c.boot_liters),
    'Safety Rating': cars.map((c) => c.safety_rating),
    'Seating': cars.map((c) => c.seating),
    'Running Cost/km': cars.map((c) => c.running_cost_per_km),
  };

  // AI Verdict
  const cacheKey = `compare:${carIds.sort().join(',')}:${sessionId || 'none'}`;
  let verdict = cache.get<string>(cacheKey);

  if (!verdict) {
    let prefContext = '';
    if (sessionId) {
      const session = await queryOne<{ preference_vector: string }>('SELECT preference_vector FROM sessions WHERE id = ?', [sessionId]);
      if (session?.preference_vector) {
        prefContext = `\n\nUser preferences: ${session.preference_vector}`;
      }
    }

    const carDescriptions = cars
      .map((c) => `${c.make} ${c.model} ${c.variant}: ${c.price_lakh}L, ${c.fuel_type} ${c.transmission}, ${c.mileage_kmpl}km/l, ${c.power_bhp}bhp, ${c.safety_rating}/5 safety, ${c.boot_liters}L boot`)
      .join('\n');

    const verdictResponse = await callLLM(
      'You are a car comparison expert. Given 2-3 cars and optionally user preferences, write a concise 3-4 sentence verdict on who should buy which car. Be specific and actionable. Do not use bullet points.',
      `Compare these cars:\n${carDescriptions}${prefContext}`,
      512,
      false
    );

    verdict = verdictResponse || generateFallbackVerdict(cars);
    cache.set(cacheKey, verdict, TTL.COMPARE_VERDICT);
  }

  res.json({ cars, specs, verdict });
}

function generateFallbackVerdict(cars: Car[]): string {
  const sorted = [...cars].sort((a, b) => a.price_lakh - b.price_lakh);
  const cheapest = sorted[0];
  const safetyBest = [...cars].sort((a, b) => (b.safety_rating || 0) - (a.safety_rating || 0))[0];

  return `The ${cheapest.make} ${cheapest.model} offers the best value at ${cheapest.price_lakh}L. For safety-conscious buyers, the ${safetyBest.make} ${safetyBest.model} leads with a ${safetyBest.safety_rating}/5 rating. Each car serves a different priority — choose based on what matters most to you.`;
}
