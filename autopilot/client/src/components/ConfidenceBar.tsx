import React from 'react';

interface ConfidenceBarProps {
  score: number;
}

export default function ConfidenceBar({ score }: ConfidenceBarProps) {
  const clampedScore = Math.min(100, Math.max(0, score));

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-widest text-text-muted">
          Confidence
        </span>
        <span className="text-xs text-text-secondary font-medium">
          {clampedScore}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-bg-raised rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedScore}%` }}
        />
      </div>
    </div>
  );
}
