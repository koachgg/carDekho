import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { compareCars } from '../api/client';
import type { Car } from '../store/useAppStore';
import CompareTable from '../components/CompareTable';

export default function Compare() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const carIdsParam = searchParams.get('cars');
  const sessionId = searchParams.get('sessionId');

  const [cars, setCars] = useState<Car[]>([]);
  const [specs, setSpecs] = useState<Record<string, (string | number | null)[]>>({});
  const [verdict, setVerdict] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!carIdsParam) return;
    const carIds = carIdsParam.split(',').map(Number).filter((n) => !isNaN(n));
    if (carIds.length < 2) return;

    setLoading(true);
    compareCars(carIds, sessionId || undefined)
      .then((data) => {
        setCars(data.cars);
        setSpecs(data.specs);
        setVerdict(data.verdict);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [carIdsParam, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center gap-1.5 mb-4">
            <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-text-secondary">Comparing your picks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="bg-bg-surface border-b border-border-default px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-text-secondary hover:text-accent transition-colors"
          >
            AutoPilot
          </button>
          {sessionId && (
            <button
              onClick={() => navigate(`/shortlist/${sessionId}`)}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Back to shortlist
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-text-primary mb-2">Side by Side</h1>
          <p className="text-sm text-text-secondary">
            Comparing {cars.length} cars across all key specs
          </p>
        </div>

        {/* Compare table */}
        <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden mb-8">
          <CompareTable cars={cars} specs={specs} />
        </div>

        {/* AI Verdict */}
        {verdict && (
          <div className="bg-accent-muted border border-accent/20 rounded-xl p-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-[10px] uppercase tracking-widest text-accent">
                AutoPilot's Verdict
              </span>
            </div>
            <p className="text-sm text-text-primary leading-relaxed">{verdict}</p>
          </div>
        )}
      </div>
    </div>
  );
}
