import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { getRecommendations, getSession, sendChatMessage } from '../api/client';
import type { ScoredCar } from '../store/useAppStore';
import CarCard from '../components/CarCard';

export default function Shortlist() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { shortlist, setShortlist, compareIds, setSessionId, setPreferences, preferences } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [whatIfInput, setWhatIfInput] = useState('');
  const [whatIfLoading, setWhatIfLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setSessionId(sessionId);

    async function load() {
      try {
        // Parallelize fetching for faster initial load
        const session = await getSession(sessionId!);
        const prefs = session.preference_vector || preferences;
        
        // Sync local state immediately
        setPreferences(prefs);
        setSessionId(sessionId!);

        // Fetch recommendations using the already-loaded prefs
        const recs = await getRecommendations({ preference_vector: prefs });
        setShortlist(recs);
      } catch (error) {
        console.error('Failed to load shortlist:', error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [sessionId]);

  async function handleWhatIf() {
    if (!whatIfInput.trim() || !sessionId || whatIfLoading) return;
    setWhatIfLoading(true);

    try {
      // Send as chat message to update preferences
      const chatResponse = await sendChatMessage(sessionId, whatIfInput);
      setPreferences(chatResponse.preference_vector);

      // Re-fetch recommendations
      const recs = await getRecommendations({ preference_vector: chatResponse.preference_vector });
      setShortlist(recs);
      setWhatIfInput('');
    } catch (error) {
      console.error('What-if failed:', error);
    } finally {
      setWhatIfLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center gap-1.5 mb-4">
            <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-text-secondary">Finding your best matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Header */}
      <div className="bg-bg-surface border-b border-border-default px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-text-secondary hover:text-accent transition-colors"
          >
            AutoPilot
          </button>
          <button
            onClick={() => navigate(`/copilot/${sessionId}`)}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Back to chat
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-medium text-text-primary mb-2">Your Top Picks</h1>
          <p className="text-sm text-text-secondary">
            Based on your preferences, here are the 3 best matches
          </p>
        </div>

        {/* Car cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {shortlist.map((car, i) => (
            <CarCard key={car.id} car={car} rank={i} sessionId={sessionId!} />
          ))}
        </div>

        {/* Compare bar */}
        {compareIds.length >= 2 && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 animate-slide-up">
            <button
              id="compare-cars-btn"
              onClick={() => navigate(`/compare?cars=${compareIds.join(',')}&sessionId=${sessionId}`)}
              className="bg-accent text-text-inverse rounded-xl px-8 py-3 text-sm font-medium
                hover:bg-accent-dark transition-all shadow-lg shadow-accent/20"
            >
              Compare {compareIds.length} cars
            </button>
          </div>
        )}

        {/* What-if input */}
        <div className="max-w-lg mx-auto">
          <p className="text-[10px] uppercase tracking-widest text-text-muted text-center mb-3">
            What if...
          </p>
          <div className="flex gap-3">
            <input
              id="what-if-input"
              type="text"
              value={whatIfInput}
              onChange={(e) => setWhatIfInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleWhatIf()}
              placeholder="What if I increase budget to 15L?"
              disabled={whatIfLoading}
              className="flex-1 bg-bg-raised border border-border-default rounded-lg px-4 py-2.5 text-sm text-text-primary
                outline-none focus:border-accent placeholder:text-text-muted disabled:opacity-50 transition-all"
            />
            <button
              onClick={handleWhatIf}
              disabled={!whatIfInput.trim() || whatIfLoading}
              className="bg-accent text-text-inverse rounded-lg px-4 py-2 text-sm font-medium
                hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {whatIfLoading ? 'Re-ranking...' : 'Re-rank'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
