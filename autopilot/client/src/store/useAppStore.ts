import { create } from 'zustand';

export interface PreferenceVector {
  budget_min_lakh: number | null;
  budget_max_lakh: number | null;
  body_types: string[] | null;
  fuel_types: string[] | null;
  transmission: string | null;
  seating_min: number | null;
  priority: string | null;
  usage: string | null;
  tags: string[] | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  options?: string[];
}

export interface Car {
  id: number;
  make: string;
  model: string;
  variant: string;
  price_lakh: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
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
  tags: string | null;
}

export interface ScoredCar extends Car {
  score: number;
  reason: string;
}

export interface Review {
  id: number;
  car_id: number;
  reviewer_name: string;
  reviewer_type: string;
  rating: number;
  title: string;
  body: string;
  ownership_months: number | null;
  pros: string | null;
  cons: string | null;
  helpful_count: number;
}

interface AppState {
  // Session
  sessionId: string | null;
  setSessionId: (id: string) => void;

  // Preferences
  preferences: PreferenceVector;
  setPreferences: (prefs: PreferenceVector) => void;

  // Confidence
  confidence: number;
  setConfidence: (score: number) => void;

  // Chat
  messages: ChatMessage[];
  setMessages: (msgs: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;

  // Top match
  topMatch: ScoredCar | null;
  setTopMatch: (car: ScoredCar | null) => void;

  // Shortlist
  shortlist: ScoredCar[];
  setShortlist: (cars: ScoredCar[]) => void;

  // Compare
  compareIds: number[];
  toggleCompare: (id: number) => void;
  clearCompare: () => void;

  // Loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Reset
  reset: () => void;
}

const emptyPrefs: PreferenceVector = {
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

export const useAppStore = create<AppState>((set) => ({
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),

  preferences: { ...emptyPrefs },
  setPreferences: (prefs) => set({ preferences: prefs }),

  confidence: 0,
  setConfidence: (score) => set({ confidence: score }),

  messages: [],
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

  topMatch: null,
  setTopMatch: (car) => set({ topMatch: car }),

  shortlist: [],
  setShortlist: (cars) => set({ shortlist: cars }),

  compareIds: [],
  toggleCompare: (id) =>
    set((state) => ({
      compareIds: state.compareIds.includes(id)
        ? state.compareIds.filter((cid) => cid !== id)
        : [...state.compareIds, id],
    })),
  clearCompare: () => set({ compareIds: [] }),

  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  reset: () =>
    set({
      sessionId: null,
      preferences: { ...emptyPrefs },
      confidence: 0,
      messages: [],
      topMatch: null,
      shortlist: [],
      compareIds: [],
      isLoading: false,
    }),
}));
