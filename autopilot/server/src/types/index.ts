// Shared TypeScript types for AutoPilot

export interface Car {
  id: number;
  make: string;
  model: string;
  variant: string;
  price_lakh: number;
  fuel_type: FuelType;
  transmission: Transmission;
  body_type: BodyType;
  seating: number;
  mileage_kmpl: number | null;
  engine_cc: number | null;
  power_bhp: number | null;
  torque_nm: number | null;
  boot_liters: number | null;
  safety_rating: number | null;
  running_cost_per_km: number | null;
  image_url: string;
  image_url_2: string | null;
  image_url_3: string | null;
  tags: string | null; // JSON array
  created_at: string;
}

export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';
export type Transmission = 'Manual' | 'Automatic' | 'CVT' | 'DCT';
export type BodyType = 'Sedan' | 'SUV' | 'Hatchback' | 'MUV' | 'Coupe';

export interface Review {
  id: number;
  car_id: number;
  reviewer_name: string;
  reviewer_type: 'Verified Owner' | 'Test Drive' | 'Expert';
  rating: number;
  title: string;
  body: string;
  ownership_months: number | null;
  pros: string | null; // JSON array
  cons: string | null; // JSON array
  helpful_count: number;
  created_at: string;
}

export interface Session {
  id: string;
  preference_vector: string | null; // JSON
  conversation_history: string | null; // JSON array
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

export interface PreferenceVector {
  budget_min_lakh: number | null;
  budget_max_lakh: number | null;
  body_types: string[] | null;
  fuel_types: string[] | null;
  transmission: string | null;
  seating_min: number | null;
  priority: 'mileage' | 'comfort' | 'safety' | 'performance' | 'value' | null;
  usage: 'city' | 'highway' | 'family' | 'adventure' | null;
  tags: string[] | null;
}

export interface IntentExtractionResult extends PreferenceVector {
  confidence_delta: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  options?: string[];
}

export interface ScoredCar extends Car {
  score: number;
  reason: string;
}

export interface ReviewSummary {
  car_id: number;
  summary: string;
  generated_at: string;
}

export interface CompareResult {
  cars: Car[];
  specs: Record<string, (string | number | null)[]>;
  verdict: string;
}
