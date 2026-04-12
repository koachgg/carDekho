import React from 'react';
import type { PreferenceVector, ScoredCar } from '../store/useAppStore';
import CarImage from './CarImage';

interface PreferencePanelProps {
  preferences: PreferenceVector;
  confidence: number;
  topMatch: ScoredCar | null;
}

const PREF_ITEMS: { key: keyof PreferenceVector; label: string; icon: string; format?: (v: unknown) => string }[] = [
  { key: 'budget_max_lakh', label: 'Budget', icon: '💰', format: (v) => `Up to ₹${v}L` },
  { key: 'body_types', label: 'Body Type', icon: '🚗', format: (v) => (v as string[]).join(', ') },
  { key: 'fuel_types', label: 'Fuel', icon: '⛽', format: (v) => (v as string[]).join(', ') },
  { key: 'transmission', label: 'Transmission', icon: '⚙️' },
  { key: 'priority', label: 'Priority', icon: '🎯', format: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1) },
  { key: 'usage', label: 'Usage', icon: '🛣️', format: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1) },
  { key: 'seating_min', label: 'Seating', icon: '👥', format: (v) => `${v}+ seats` },
];

export default function PreferencePanel({ preferences, confidence, topMatch }: PreferencePanelProps) {
  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(n);

  const filledCount = PREF_ITEMS.filter(({ key }) => {
    const v = preferences[key];
    return v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0);
  }).length;

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Your Profile</h3>
            <p className="text-[11px] text-gray-500">Updates live as you chat</p>
          </div>
        </div>

        {/* Confidence Ring */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#1e1e3f" strokeWidth="4" />
              <circle
                cx="28" cy="28" r="24" fill="none"
                stroke="url(#confidence-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(confidence / 100) * 150.8} 150.8`}
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="confidence-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{confidence}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400">Match Confidence</p>
            <p className="text-[11px] text-gray-600 mt-0.5">
              {confidence < 30 ? 'Just getting started...' :
               confidence < 60 ? 'Getting to know you' :
               confidence < 85 ? 'Almost there!' :
               'Ready to match! 🎯'}
            </p>
          </div>
        </div>

        {/* Preference Tags */}
        <div className="space-y-2">
          {PREF_ITEMS.map(({ key, label, icon, format }) => {
            const value = preferences[key];
            const hasValue = value !== null && value !== undefined &&
              !(Array.isArray(value) && value.length === 0);

            return (
              <div
                key={key}
                className={`flex items-center justify-between py-2 px-3 rounded-xl transition-all duration-300 ${
                  hasValue
                    ? 'bg-purple-500/[0.08] border border-purple-500/20'
                    : 'bg-white/[0.02] border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm">{icon}</span>
                  <span className="text-xs text-gray-400">{label}</span>
                </span>
                {hasValue ? (
                  <span className="text-xs font-medium text-purple-300">
                    {format ? format(value) : String(value)}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-600 italic">Listening...</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mt-4 justify-center">
          {PREF_ITEMS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i < filledCount
                  ? 'w-6 bg-gradient-to-r from-purple-500 to-indigo-500'
                  : 'w-1.5 bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Top Match Card */}
      {topMatch && (
        <div className="bg-[#1a1a2e]/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden animate-slide-up">
          <div className="px-4 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                Live Best Match
              </span>
            </div>
          </div>
          <CarImage
            src={topMatch.image_url}
            alt={`${topMatch.make} ${topMatch.model}`}
            className="w-full aspect-[16/10]"
          />
          <div className="p-4">
            <p className="text-base font-semibold text-white mb-0.5">
              {topMatch.make} {topMatch.model}
            </p>
            <p className="text-sm text-gray-400">
              ₹{formatPrice(topMatch.price_lakh)} Lakh
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-green-400 transition-all duration-700"
                  style={{ width: `${topMatch.score}%` }}
                />
              </div>
              <span className="text-xs font-medium text-green-400">{topMatch.score}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
