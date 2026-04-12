import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { sendChatMessage, getSession } from '../api/client';
import ChatMessage from '../components/ChatMessage';
import OptionButtons from '../components/OptionButtons';
import PreferencePanel from '../components/PreferencePanel';

export default function Copilot() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    messages, setMessages,
    preferences, setPreferences,
    confidence, setConfidence,
    topMatch, setTopMatch,
    isLoading, setLoading,
    setSessionId,
  } = useAppStore();

  // Load session if coming from direct URL or create new if needed
  useEffect(() => {
    if (!sessionId) {
      import('../api/client').then(({ createSession }) => {
        createSession().then((session) => {
          navigate(`/copilot/${session.id}`, { replace: true });
        }).catch(console.error);
      });
      return;
    }
    
    if (sessionId && messages.length === 0) {
      setSessionId(sessionId);
      getSession(sessionId).then((session) => {
        if (session.conversation_history) {
          setMessages(session.conversation_history);
        }
        if (session.preference_vector) {
          setPreferences(session.preference_vector);
        }
        setConfidence(session.confidence_score || 0);
      }).catch(console.error);
    }
  }, [sessionId, navigate]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input after loading finishes
  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  async function handleSend(text: string) {
    if (!text.trim() || !sessionId || isLoading) return;
    setLoading(true);
    setIsTyping(true);
    setInput('');

    try {
      const response = await sendChatMessage(sessionId, text);
      setIsTyping(false);
      setMessages(response.conversation_history);
      setPreferences(response.preference_vector);
      setConfidence(response.confidence_score);
      setTopMatch(response.top_match);
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  }

  // Get the last assistant message's options
  const lastMessage = messages[messages.length - 1];
  const showOptions = lastMessage?.role === 'assistant' && lastMessage.options && lastMessage.options.length > 0;
  const showShortlistCTA = confidence >= 80 || 
    (lastMessage?.options?.includes('See my shortlist'));

  // Welcome state when no messages yet
  const isEmptyChat = messages.length === 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="flex w-full max-w-7xl mx-auto">
        
        {/* Chat area — 65% */}
        <div className="w-[65%] flex flex-col h-[calc(100vh-64px)] relative">
          
          {/* Ambient glow behind chat */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-600/[0.04] blur-[100px] rounded-full pointer-events-none" />

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 relative">
            
            {/* Empty state */}
            {isEmptyChat && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/20">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Hey there! 👋</h2>
                <p className="text-sm text-gray-500 text-center max-w-sm mb-8">
                  I'm your AI car concierge. Tell me what you're looking for and I'll find your perfect match.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {[
                    "I need a family car under 15 Lakh",
                    "What's good for daily city commute?",
                    "Looking for a powerful SUV"
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSend(suggestion)}
                      className="bg-[#1a1a2e]/60 backdrop-blur-sm border border-white/[0.06] rounded-full px-5 py-2.5 text-sm text-gray-400
                        hover:border-purple-500/30 hover:text-white hover:bg-purple-500/10 hover:shadow-lg hover:shadow-purple-500/5
                        transition-all duration-200 active:scale-95"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <ChatMessage 
                key={i} 
                message={msg} 
                isLatest={i === messages.length - 1 && msg.role === 'assistant'}
              />
            ))}

            {/* Option buttons for last assistant message */}
            {showOptions && !isLoading && (
              <OptionButtons
                options={lastMessage.options!.filter(o => o !== 'See my shortlist')}
                onSelect={handleSend}
                disabled={isLoading}
              />
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-white/[0.06] rounded-2xl rounded-bl-md px-5 py-3.5">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Shortlist & Browse CTA */}
            {showShortlistCTA && !isLoading && (
              <div className="flex flex-col items-center gap-4 pt-6 pb-2 animate-slide-up">
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-2" />
                <p className="text-xs text-gray-500 text-center max-w-xs">
                  I've built a personalized shortlist based on everything you've told me
                </p>
                <div className="flex gap-3">
                  <button
                    id="see-shortlist-btn"
                    onClick={() => navigate(`/shortlist/${sessionId}`)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-7 py-3 text-sm font-medium
                      hover:shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02]
                      active:scale-95 transition-all duration-200"
                  >
                    ✨ See my shortlist
                  </button>
                  <button
                    id="browse-catalogue-btn"
                    onClick={() => navigate('/browse')}
                    className="bg-white/[0.04] border border-white/[0.08] text-gray-300 rounded-full px-6 py-3 text-sm font-medium
                      hover:bg-white/[0.08] hover:text-white
                      active:scale-95 transition-all duration-200"
                  >
                    Browse all cars
                  </button>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input bar */}
          <div className="px-6 py-4 border-t border-white/[0.04]">
            <div className="relative flex items-center gap-3 bg-[#12121f] border border-white/[0.06] rounded-2xl px-4 py-1 
              focus-within:border-purple-500/30 focus-within:shadow-lg focus-within:shadow-purple-500/5 transition-all duration-300">
              <input
                ref={inputRef}
                id="copilot-chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isEmptyChat ? "Tell me about your dream car..." : "Type anything..."}
                disabled={isLoading}
                className="flex-1 bg-transparent py-3 text-sm text-white
                  outline-none placeholder:text-gray-600 disabled:opacity-50"
              />
              <button
                id="copilot-send-btn"
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl flex items-center justify-center
                  bg-gradient-to-r from-purple-600 to-indigo-600
                  disabled:opacity-20 disabled:cursor-not-allowed
                  hover:shadow-lg hover:shadow-purple-500/20 active:scale-90
                  transition-all duration-200"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-700 text-center mt-2">
              AutoPilot uses AI to understand your preferences • Your data stays private
            </p>
          </div>
        </div>

        {/* Preference panel — 35% */}
        <div className="w-[35%] border-l border-white/[0.04] h-[calc(100vh-64px)] overflow-y-auto p-5 bg-[#0a0a0f]">
          <PreferencePanel
            preferences={preferences}
            confidence={confidence}
            topMatch={topMatch}
          />
        </div>
      </div>
    </div>
  );
}
