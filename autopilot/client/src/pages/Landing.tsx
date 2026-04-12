import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession, sendChatMessage } from '../api/client';
import { useAppStore } from '../store/useAppStore';

const QUICK_PICKS = [
  'City commute under 10L',
  'Safe family car',
  'Fun to drive under 20L',
];

export default function Landing() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSessionId, setMessages, setPreferences, setConfidence, setTopMatch } = useAppStore();

  async function handleSubmit(text: string) {
    if (!text.trim() || loading) return;
    setLoading(true);

    try {
      const session = await createSession();
      setSessionId(session.id);
      const chatResponse = await sendChatMessage(session.id, text);
      setMessages(chatResponse.conversation_history);
      setPreferences(chatResponse.preference_vector);
      setConfidence(chatResponse.confidence_score);
      setTopMatch(chatResponse.top_match);
      navigate(`/copilot/${session.id}`);
    } catch (error) {
      console.error('Failed to start session:', error);
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(query);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col relative overflow-hidden">
      
      {/* Absolute Background Grid & Glows specific to the hero */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center pt-24 px-6 z-10 w-full animate-fade-in text-center max-w-5xl mx-auto">
        
        <div className="inline-block border border-accent/30 bg-accent/10 backdrop-blur-sm text-accent-light px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(160,91,248,0.2)]">
          The only AI co-pilot you need
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-text-primary leading-[1.1] mb-6 tracking-tight">
          Find your perfect car <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-light via-accent to-accent-dark">
            without the guesswork.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-12">
          Handling complex specs, analyzing millions of reviews, and streamlining your decision, so you drive home happy.
        </p>

        {/* Input Area */}
        <div className="w-full max-w-2xl relative mb-8 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accent-dark rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          <div className="relative bg-bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. A safe family SUV under 15 Lakhs for mostly highway driving"
              disabled={loading}
              className="w-full bg-transparent border-none px-6 py-4 text-base text-text-primary outline-none placeholder:text-text-muted disabled:opacity-50"
            />
            <button
              onClick={() => handleSubmit(query)}
              disabled={!query.trim() || loading}
              className="shrink-0 bg-accent hover:bg-accent-light text-white rounded-xl px-8 py-4 font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Start Engine'
              )}
            </button>
          </div>
        </div>

        {/* Quick Picks - Pill style */}
        <div className="flex flex-wrap justify-center gap-3 w-full max-w-2xl">
          {QUICK_PICKS.map((pick) => (
            <button
              key={pick}
              onClick={() => { setQuery(pick); handleSubmit(pick); }}
              disabled={loading}
              className="bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-sm text-text-secondary hover:bg-white/10 hover:text-white hover:border-accent/50 transition-all font-medium disabled:opacity-40"
            >
              {pick}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Box Features Section */}
      <div className="w-full max-w-6xl mx-auto px-6 pb-24 mt-20 z-10">
        <h2 className="text-3xl font-bold mb-10 text-center">Intelligent tools to decide faster</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-bg-surface/50 backdrop-blur-sm border border-border-default rounded-3xl p-8 hover:border-accent/40 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <h3 className="text-xl font-semibold mb-3">Live Preference Matching</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              As you chat, our AI builds a vector of your requirements, automatically narrowing down millions of data points to your top 3 cars in real-time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-bg-surface/50 backdrop-blur-sm border border-border-default rounded-3xl p-8 hover:border-accent/40 transition-colors group relative overflow-hidden hidden md:block">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <h3 className="text-xl font-semibold mb-3">The ultimate vibe check</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              We aggregate what the world actually says about the car, so you don't have to endlessly scroll through Reddit, YouTube comments, and dead-end forum posts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-bg-surface/50 backdrop-blur-sm border border-border-default rounded-3xl p-8 hover:border-accent/40 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            <h3 className="text-xl font-semibold mb-3">AI Verdict Comparisons</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Don't just stare at spec sheets. Select any two cars and get a definitive, human-readable verdict on which one is objectively better for your exact needs.
            </p>
          </div>

        </div>
      </div>
      
      {/* Footer Banner */}
      <div className="w-full bg-gradient-to-b from-transparent to-accent/10 border-t border-border-subtle py-16 text-center z-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent pointer-events-none" />
        <h2 className="text-2xl md:text-3xl font-bold mb-4">See what AutoPilot can do for you</h2>
        <p className="text-text-secondary mb-8">Get started and see how AI can transform your car buying experience — faster, smarter, better.</p>
        <button className="bg-accent hover:bg-accent-light text-white px-8 py-3 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(160,91,248,0.3)]">
          Browse the Catalogue
        </button>
      </div>

    </div>
  );
}
