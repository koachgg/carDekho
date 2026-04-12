import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getCarById } from '../api/client';
import type { Car } from '../store/useAppStore';
import CarImage from '../components/CarImage';
import ReviewSection from '../components/ReviewSection';

export default function CarDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCarById(Number(id))
      .then((data) => setCar(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !car) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" />
          <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  const images = [car.image_url, car.image_url_2, car.image_url_3].filter(Boolean) as string[];
  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(n);

  const specs = [
    { label: 'Mileage', value: car.mileage_kmpl ? `${car.mileage_kmpl} km/l` : '--' },
    { label: 'Engine', value: car.engine_cc ? `${car.engine_cc} cc` : '--' },
    { label: 'Power', value: car.power_bhp ? `${car.power_bhp} bhp` : '--' },
    { label: 'Torque', value: car.torque_nm ? `${car.torque_nm} Nm` : '--' },
    { label: 'Boot Space', value: car.boot_liters ? `${car.boot_liters} L` : '--' },
    { label: 'Seating', value: `${car.seating} seats` },
    { label: 'Safety', value: car.safety_rating ? `${car.safety_rating}/5 stars` : '--' },
    { label: 'Transmission', value: car.transmission },
  ];

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
          {sessionId && (
            <button
              onClick={() => navigate(`/shortlist/${sessionId}`)}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Back to shortlist
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Image gallery */}
        <div className="mb-8">
          <CarImage
            src={images[selectedImage]}
            alt={`${car.make} ${car.model}`}
            className="w-full aspect-video rounded-xl overflow-hidden mb-3"
          />
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-32 aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-accent' : 'border-border-default hover:border-border-strong'
                  }`}
                >
                  <CarImage src={img} alt={`View ${i + 1}`} className="w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Car name and price */}
        <div className="mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{car.make} {car.model}</h1>
            <p className="text-text-secondary text-lg mb-4">{car.variant} • {car.body_type}</p>
            
            <div className="flex gap-3 mb-6">
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(car.make + ' ' + car.model + ' review')}`} target="_blank" rel="noopener noreferrer" className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                Watch XT Reviews
              </a>
              <a href={`https://www.cardekho.com/cars/${car.make}`} target="_blank" rel="noopener noreferrer" className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                Check on CarDekho
              </a>
            </div>
          </div>
          <p className="text-xl font-medium text-accent mt-2">
            {formatPrice(car.price_lakh)} Lakh
          </p>
          <div className="flex gap-2 mt-3">
            <span className="text-[11px] bg-bg-raised border border-border-subtle rounded-full px-3 py-1 text-text-secondary">
              {car.fuel_type}
            </span>
            <span className="text-[11px] bg-bg-raised border border-border-subtle rounded-full px-3 py-1 text-text-secondary">
              {car.body_type}
            </span>
          </div>
        </div>

        {/* Specs grid */}
        <div className="bg-bg-surface border border-border-default rounded-xl p-6 mb-8">
          <h2 className="text-[10px] uppercase tracking-widest text-text-muted mb-4">
            Specifications
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {specs.map(({ label, value }) => (
              <div key={label}>
                <span className="text-[10px] uppercase tracking-widest text-text-muted block mb-1">
                  {label}
                </span>
                <span className="text-sm font-medium text-text-primary">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border-default mb-8" />

        {/* Reviews */}
        <ReviewSection carId={car.id} />
      </div>
    </div>
  );
}
