import { queryAll, queryOne, execute } from '../db/database';
import { callLLM } from './llm.service';
import { Review, ReviewSummary } from '../types';

const SYSTEM_PROMPT = `You are a car review analyst. Given a list of user reviews for a car, write a concise 3-sentence AI-generated summary in the style of Amazon's 'AI-generated from customer reviews'.
Focus on: overall sentiment, most praised aspect, most common criticism.
Start with: 'Customers generally...'
Do not use bullet points. Return only the summary paragraph.`;

export async function getOrGenerateReviewSummary(carId: number): Promise<ReviewSummary | null> {
  // Check DB cache first
  const cached = queryOne<ReviewSummary>(
    'SELECT * FROM review_summaries WHERE car_id = ?',
    [carId]
  );

  if (cached) {
    const generatedAt = new Date(cached.generated_at).getTime();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (generatedAt > sevenDaysAgo) {
      return cached;
    }
  }

  // Fetch reviews
  const reviews = queryAll<Review>(
    'SELECT * FROM reviews WHERE car_id = ? ORDER BY helpful_count DESC',
    [carId]
  );

  const car = queryOne<{ make: string; model: string; variant: string; body_type: string; fuel_type: string; price_lakh: number }>(
    'SELECT make, model, variant, body_type, fuel_type, price_lakh FROM cars WHERE id = ?',
    [carId]
  );
  if (!car) return null;

  const carName = `${car.make} ${car.model} ${car.variant}`;

  if (reviews.length === 0) {
    // Generate an AI reputation summary based on the car's specs since no reviews exist
    const specPrompt = `Based on industry reputation, generate a 3-sentence summary for the ${carName} (${car.body_type}, ${car.fuel_type}, ₹${car.price_lakh} Lakh). Start with 'Experts generally...' and focus on overall vibe and value. No bullet points.`;
    const specSummary = await callLLM(
      "You are an expert car reviewer writing a concise summary.",
      specPrompt,
      512,
      false
    );
    return saveSummary(carId, specSummary || `Experts generally view the ${carName} as a solid choice in its segment, offering balanced performance and reliable value for its price of ₹${car.price_lakh} Lakh.`);
  }

  // Build review text for LLM
  let reviewText = reviews
    .map((r) => {
      const pros = r.pros ? JSON.parse(r.pros).join(', ') : '';
      const cons = r.cons ? JSON.parse(r.cons).join(', ') : '';
      return `[${r.reviewer_type}, ${r.rating}/5] "${r.title}" — ${r.body}${pros ? ` Pros: ${pros}.` : ''}${cons ? ` Cons: ${cons}.` : ''}`;
    })
    .join('\n\n');

  // Cap size so it doesn't break LLM limits
  reviewText = reviewText.slice(0, 3000);

  const userMessage = `Car: ${carName}\n\nReviews:\n${reviewText}`;
  const summary = await callLLM(SYSTEM_PROMPT, userMessage, 512, false);

  if (!summary) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const fallback = `Customers generally rate the ${carName} ${avgRating.toFixed(1)} out of 5 stars. Owners frequently praise its overall value and reliability. Some users note areas for improvement in certain aspects of the ownership experience.`;
    return saveSummary(carId, fallback);
  }

  return saveSummary(carId, summary);
}

function saveSummary(carId: number, summary: string): ReviewSummary {
  const now = new Date().toISOString();
  execute(
    'INSERT OR REPLACE INTO review_summaries (car_id, summary, generated_at) VALUES (?, ?, ?)',
    [carId, summary, now]
  );
  return { car_id: carId, summary, generated_at: now };
}
