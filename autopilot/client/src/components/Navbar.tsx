import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse Cars', path: '/browse' },
    { name: 'Copilot', path: '/copilot/new' },
    { name: 'Help & FAQ', path: '/contact' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-surface/80 backdrop-blur-md border-b border-border-subtle shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(224,123,84,0.4)] group-hover:shadow-[0_0_25px_rgba(224,123,84,0.6)] transition-all">
            A
          </div>
          <span className="text-xl font-semibold tracking-tight text-white group-hover:text-accent-light transition-colors">
            AutoPilot
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path.includes('copilot') && location.pathname.includes('copilot'));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                  isActive ? 'text-accent' : 'text-text-secondary hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </div>

        {/* Action */}
        <div className="flex items-center gap-4">
          <Link
            to="/copilot/new"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full px-5 py-2 text-sm font-medium transition-all hover:border-accent/50 hover:shadow-[0_0_15px_rgba(224,123,84,0.2)]"
          >
            Find My Match
          </Link>
        </div>
      </div>
    </nav>
  );
}
