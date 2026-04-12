import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col font-sans selection:bg-accent/30">
      <Navbar />
      <main className="flex-1 pt-16 flex flex-col relative w-full">
        {/* Subtle background glow effect for premium feel */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        {children}
      </main>
    </div>
  );
}
