import React from 'react';
import type { Car } from '../store/useAppStore';
import CarImage from './CarImage';

interface CompareTableProps {
  cars: Car[];
  specs: Record<string, (string | number | null)[]>;
}

// Specs where higher = better
const HIGHER_IS_BETTER = new Set([
  'Mileage (km/l)', 'Power (bhp)', 'Torque (Nm)', 'Boot Space (L)', 'Safety Rating', 'Seating'
]);
// Specs where lower = better
const LOWER_IS_BETTER = new Set(['Price', 'Running Cost/km']);

function getWinnerIndex(specName: string, values: (string | number | null)[]): number | null {
  const numValues = values.map((v) => (typeof v === 'number' ? v : null));
  const validValues = numValues.filter((v): v is number => v !== null);
  if (validValues.length < 2) return null;

  if (HIGHER_IS_BETTER.has(specName)) {
    const max = Math.max(...validValues);
    return numValues.indexOf(max);
  }
  if (LOWER_IS_BETTER.has(specName)) {
    const min = Math.min(...validValues);
    return numValues.indexOf(min);
  }
  return null;
}

export default function CompareTable({ cars, specs }: CompareTableProps) {
  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(n);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {/* Car images and names */}
        <thead>
          <tr>
            <th className="text-left p-3 text-[10px] uppercase tracking-widest text-text-muted align-bottom w-40">
              Spec
            </th>
            {cars.map((car) => (
              <th key={car.id} className="p-3 text-center">
                <CarImage
                  src={car.image_url}
                  alt={`${car.make} ${car.model}`}
                  className="w-full aspect-video rounded-lg overflow-hidden mb-3"
                />
                <p className="text-sm font-medium text-text-primary">
                  {car.make} {car.model}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">{car.variant}</p>
                <p className="text-sm font-medium text-accent mt-1">
                  {formatPrice(car.price_lakh)}L
                </p>
              </th>
            ))}
          </tr>
        </thead>

        {/* Spec rows */}
        <tbody>
          {Object.entries(specs).map(([specName, values]) => {
            const winnerIdx = getWinnerIndex(specName, values);

            return (
              <tr key={specName} className="border-t border-border-subtle">
                <td className="p-3 text-xs text-text-muted whitespace-nowrap">
                  {specName}
                </td>
                {values.map((value, i) => (
                  <td
                    key={i}
                    className={`p-3 text-center text-sm ${
                      winnerIdx === i
                        ? 'bg-successBg text-success font-medium'
                        : 'text-text-primary'
                    }`}
                  >
                    {value !== null && value !== undefined
                      ? specName === 'Price'
                        ? `${formatPrice(value as number)}L`
                        : typeof value === 'number'
                        ? value.toFixed(1)
                        : value
                      : '--'}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
