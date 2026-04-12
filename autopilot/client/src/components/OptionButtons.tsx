import React from 'react';

interface OptionButtonsProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export default function OptionButtons({ options, onSelect, disabled = false }: OptionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 pl-11 animate-slide-up">
      {options.map((option, i) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className="group relative border border-white/[0.08] bg-[#1a1a2e]/60 backdrop-blur-sm 
            rounded-full px-5 py-2.5 text-sm text-gray-300
            hover:border-purple-500/40 hover:text-white hover:bg-purple-500/10 
            hover:shadow-lg hover:shadow-purple-500/5
            active:scale-95
            transition-all duration-200 ease-out
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/[0.08] disabled:hover:text-gray-300 disabled:hover:bg-transparent"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <span className="relative z-10">{option}</span>
        </button>
      ))}
    </div>
  );
}
