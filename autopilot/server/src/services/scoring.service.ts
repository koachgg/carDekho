import { Car, PreferenceVector } from '../types';

export function scoreCar(car: Car, prefs: PreferenceVector): number {
  let score = 100;

  // Budget: hard disqualifier above max, small penalty near ceiling
  if (prefs.budget_max_lakh && car.price_lakh > prefs.budget_max_lakh) return 0;
  if (prefs.budget_min_lakh && car.price_lakh < prefs.budget_min_lakh) score -= 10;

  const budgetHeadroom = prefs.budget_max_lakh
    ? (prefs.budget_max_lakh - car.price_lakh) / prefs.budget_max_lakh
    : 0.5;
  score += budgetHeadroom * 10;

  // Priority weighting
  if (prefs.priority === 'mileage' && car.mileage_kmpl) {
    score += (car.mileage_kmpl / 30) * 25;
  }
  if (prefs.priority === 'safety' && car.safety_rating) {
    score += (car.safety_rating / 5) * 25;
  }
  if (prefs.priority === 'value') {
    score += ((15 - car.price_lakh) / 15) * 25;
  }
  if (prefs.priority === 'comfort') {
    score += ((car.boot_liters || 0) / 600) * 15 + (car.seating / 7) * 10;
  }
  if (prefs.priority === 'performance' && car.power_bhp) {
    score += (car.power_bhp / 170) * 25;
  }

  // Fuel match
  if (prefs.fuel_types?.length && !prefs.fuel_types.includes(car.fuel_type)) {
    score -= 30;
  }

  // Transmission match (treat CVT and DCT as "Automatic" for matching)
  if (prefs.transmission) {
    const carTransAuto = ['CVT', 'DCT', 'Automatic'].includes(car.transmission);
    const prefWantsAuto = prefs.transmission === 'Automatic';
    if (prefWantsAuto && !carTransAuto) score -= 20;
    if (!prefWantsAuto && carTransAuto) score -= 20;
  }

  // Body type match
  if (prefs.body_types?.length && !prefs.body_types.includes(car.body_type)) {
    score -= 20;
  }

  // Seating match
  if (prefs.seating_min && car.seating < prefs.seating_min) {
    score -= 15;
  }

  // Tag interactions
  const carTags = car.tags ? (Array.isArray(car.tags) ? car.tags : (typeof car.tags === 'string' ? JSON.parse(car.tags) : [])) : [];
  
  if (Array.isArray(carTags)) {
     // Usage-to-tag match
    if (prefs.usage && carTags.includes(prefs.usage)) {
        score += 15;
    }

    // Tag overlap bonus
    if (prefs.tags?.length) {
        const overlap = prefs.tags.filter((t) => carTags.includes(t)).length;
        score += overlap * 5;
    }
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}
