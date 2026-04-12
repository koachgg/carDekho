import axios from 'axios';
import type { Car, ScoredCar, Review, PreferenceVector, ChatMessage } from '../store/useAppStore';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ============ Sessions ============

export async function createSession(): Promise<{ id: string }> {
  const { data } = await api.post('/sessions');
  return data;
}

export async function getSession(id: string) {
  const { data } = await api.get(`/sessions/${id}`);
  return data;
}

export async function updateSession(id: string, body: { preference_vector?: PreferenceVector; confidence_score?: number }) {
  const { data } = await api.patch(`/sessions/${id}`, body);
  return data;
}

// ============ Chat ============

interface ChatResponse {
  message: ChatMessage;
  preference_vector: PreferenceVector;
  confidence_score: number;
  top_match: ScoredCar | null;
  conversation_history: ChatMessage[];
}

export async function sendChatMessage(sessionId: string, message: string): Promise<ChatResponse> {
  const { data } = await api.post(`/chat/${sessionId}/message`, { message });
  return data;
}

// ============ Cars ============

export async function searchCars(filters?: Record<string, string>): Promise<Car[]> {
  const { data } = await api.get('/cars', { params: filters });
  return data;
}

export async function getCarById(id: number): Promise<Car> {
  const { data } = await api.get(`/cars/${id}`);
  return data;
}

export async function getRecommendations(body: { preference_vector?: PreferenceVector; sessionId?: string }): Promise<ScoredCar[]> {
  const { data } = await api.post('/cars/recommend', body);
  return data;
}

export async function compareCars(carIds: number[], sessionId?: string): Promise<{ cars: Car[]; specs: Record<string, (string | number | null)[]>; verdict: string }> {
  const { data } = await api.post('/cars/compare', { carIds, sessionId });
  return data;
}

// ============ Reviews ============

export async function getReviewsByCarId(carId: number): Promise<Review[]> {
  const { data } = await api.get(`/reviews/car/${carId}`);
  return data;
}

export async function getAISummary(carId: number): Promise<{ car_id: number; summary: string; generated_at: string }> {
  const { data } = await api.get(`/reviews/car/${carId}/summary`);
  return data;
}
