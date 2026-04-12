import React, { useState } from 'react';

const FAQs = [
  {
    q: "How does AutoPilot match me with cars?",
    a: "Our AI engine analyzes your conversational inputs to build a preference vector, instantly scoring thousands of cars based on your budget, body type, fuel preferences, and even implied lifestyle priorities."
  },
  {
    q: "Is my conversation history private?",
    a: "Absolutely. We keep your data confidential and safe. Only you have access to your work. All your data travels through a secure, encrypted tunnel."
  },
  {
    q: "How accurate are the car price estimates?",
    a: "Prices are updated regularly based on average ex-showroom data across India. However, local dealership prices, on-road taxes, and registration fees may vary depending on your exact location."
  },
  {
    q: "Can I save my shortlists for later?",
    a: "Currently, your shortlist is tied to your active live session. We are working on a secure login portal that will let you save and compare shortlists over long periods!"
  }
];

function FaqItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/[0.06] rounded-2xl bg-[#1a1a2e]/40 backdrop-blur-sm overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none hover:bg-white/[0.02]"
      >
        <span className="text-base font-medium text-gray-200">{q}</span>
        <div className={`w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center transition-transform duration-300 ${isOpen ? 'bg-purple-500/20 text-purple-400 rotate-180' : 'bg-transparent text-gray-400'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-sm text-gray-400 leading-relaxed pt-2 border-t border-white/[0.04]">{a}</p>
      </div>
    </div>
  );
}

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-purple-600/[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[300px] bg-indigo-600/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 py-16 relative z-10 animate-fade-in stagger-children">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Help & <span className="text-gradient">Community</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need, explained in detail. Join thousands of car enthusiasts discovering their perfect match together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
          
          {/* Main Support Form */}
          <div className="lg:col-span-3 bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 shadow-2xl shadow-purple-500/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Send us a message</h2>
                <p className="text-sm text-gray-400">Our support team usually replies within 24 hours.</p>
              </div>
            </div>

            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">Name</label>
                  <input type="text" className="w-full bg-[#12121f] border border-white/[0.06] rounded-xl px-4 py-3.5 text-sm text-white focus:border-purple-500/50 focus:bg-purple-500/[0.02] outline-none transition-all placeholder:text-gray-600" placeholder="John Doe" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">Email</label>
                  <input type="email" className="w-full bg-[#12121f] border border-white/[0.06] rounded-xl px-4 py-3.5 text-sm text-white focus:border-purple-500/50 focus:bg-purple-500/[0.02] outline-none transition-all placeholder:text-gray-600" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">How can we help?</label>
                <textarea rows={4} className="w-full bg-[#12121f] border border-white/[0.06] rounded-xl px-4 py-3.5 text-sm text-white focus:border-purple-500/50 focus:bg-purple-500/[0.02] outline-none transition-all placeholder:text-gray-600 resize-none" placeholder="Describe your issue or feedback..." />
              </div>
              <button type="button" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-3.5 rounded-xl hover:shadow-xl hover:shadow-purple-500/20 active:scale-[0.98] transition-all">
                Send Message
              </button>
            </form>
          </div>

          {/* Community Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border border-white/[0.08] backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full group-hover:bg-purple-500/30 transition-all" />
              
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30 text-indigo-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 relative z-10">Join the Discord</h3>
              <p className="text-sm text-indigo-200 mb-6 relative z-10">Connect with other car enthusiasts, get buying advice, and share your shortlists.</p>
              <button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium px-5 py-3 rounded-xl transition-colors relative z-10 flex items-center justify-center gap-2">
                Launch Discord
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#1a1a2e]/60 to-[#12121f]/80 border border-white/[0.06] backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 text-gray-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Follow for Updates</h3>
              <p className="text-sm text-gray-400 mb-6">Stay updated with the latest AI improvements and car market trends.</p>
              <button className="bg-transparent border border-gray-600 hover:border-white text-gray-300 hover:text-white font-medium px-5 py-2.5 rounded-xl transition-all w-full flex items-center justify-center gap-2">
                @AutoPilotAI
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-400">Quick answers to get you started fast.</p>
          </div>
          <div className="space-y-4">
            {FAQs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
