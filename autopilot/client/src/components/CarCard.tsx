import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ScoredCar } from '../store/useAppStore';
import { useAppStore } from '../store/useAppStore';
import CarImage from './CarImage';
import StarRating from './StarRating';

interface CarCardProps {
  car: ScoredCar;
  rank: number;
  sessionId: string;
}

export default function CarCard({ car, rank, sessionId }: CarCardProps) {
  const navigate = useNavigate();
  const { compareIds, toggleCompare } = useAppStore();
  const isCompareSelected = compareIds.includes(car.id);
  const isBestMatch = rank === 0;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(n);

  return (
    <div
      className={`bg-bg-surface border rounded-xl overflow-hidden animate-slide-up transition-all duration-200
        ${isBestMatch ? 'border-accent' : 'border-border-default'}
        ${isBestMatch ? 'scale-[1.02]' : ''}`}
      style={{ animationDelay: `${rank * 100}ms`, animationFillMode: 'both' }}
    >
      {/* Best Match badge */}
      {isBestMatch && (
        <div className="bg-accent px-4 py-1.5 text-center">
          <span className="text-[10px] uppercase tracking-widest text-text-inverse font-medium">
            Best Match
          </span>
        </div>
      )}

      {/* Image */}
      <CarImage
        src={car.image_url}
        alt={`${car.make} ${car.model}`}
        className="w-full aspect-video"
      />

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-medium text-text-primary">
              {car.make} {car.model}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">{car.variant}</p>
          </div>
          <span className="text-sm font-medium text-accent bg-accent-muted px-2.5 py-1 rounded-lg">
            {car.score}% match
          </span>
        </div>

        {/* Price */}
        <p className="text-lg font-medium text-text-primary mb-3">
          {formatPrice(car.price_lakh)} Lakh
        </p>

        {/* Spec pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {car.mileage_kmpl && (
            <span className="text-[11px] bg-bg-raised border border-border-subtle rounded-full px-3 py-1 text-text-secondary">
              {car.mileage_kmpl} km/l
            </span>
          )}
          {car.safety_rating && (
            <span className="text-[11px] bg-bg-raised border border-border-subtle rounded-full px-3 py-1 text-text-secondary flex items-center gap-1">
              <StarRating rating={1} max={1} size="sm" />
              {car.safety_rating}/5
            </span>
          )}
          <span className="text-[11px] bg-bg-raised border border-border-subtle rounded-full px-3 py-1 text-text-secondary">
            {car.transmission}
          </span>
        </div>

        {/* Reason */}
        <p className="text-xs text-text-secondary leading-relaxed mb-4 italic">
          {car.reason}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/cars/${car.id}?sessionId=${sessionId}`)}
            className="flex-1 bg-accent text-text-inverse rounded-lg px-4 py-2 text-sm font-medium
              hover:bg-accent-dark transition-colors"
          >
            View details
          </button>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isCompareSelected}
              onChange={() => toggleCompare(car.id)}
              className="w-4 h-4 rounded border-border-default bg-bg-raised accent-accent"
            />
            <span className="text-xs text-text-secondary">Compare</span>
          </label>
        </div>
      </div>
    </div>
  );
}
