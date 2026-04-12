import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCars } from '../api/client';
import { Car } from '../store/useAppStore';
import CarCard from '../components/CarCard';

export default function Browse() {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [brandStr, setBrandStr] = useState('');
  const [budgetStr, setBudgetStr] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const filters: any = {};
        if (brandStr) filters.make = brandStr;
        if (budgetStr) {
           // For simple filter setup: <10, 10-20, >20
           if (budgetStr === '10') { filters.budgetMin = 0; filters.budgetMax = 10; }
           else if (budgetStr === '20') { filters.budgetMin = 10; filters.budgetMax = 20; }
           else if (budgetStr === '30') { filters.budgetMin = 20; filters.budgetMax = 200; }
        }
        
        const data = await searchCars(filters);
        setCars(data);
      } catch (err) {
        console.error('Failed to load cars', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [brandStr, budgetStr]);
  
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full animate-fade-in">
      <div className="flex flex-col md:flex-row items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold mb-2">Catalogue</h1>
          <p className="text-text-secondary">Explore all {cars.length > 0 ? cars.length : ''} verified models in the Indian market.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <select 
            value={brandStr}
            onChange={(e) => setBrandStr(e.target.value)}
            className="bg-bg-surface border border-border-subtle rounded-lg px-4 py-2 text-sm outline-none focus:border-accent transition-colors"
          >
            <option value="">All Brands</option>
            <option value="Tata">Tata</option>
            <option value="Maruti">Maruti</option>
            <option value="Hyundai">Hyundai</option>
            <option value="Mahindra">Mahindra</option>
            <option value="Kia">Kia</option>
            <option value="Toyota">Toyota</option>
            <option value="Renault">Renault</option>
            <option value="Nissan">Nissan</option>
          </select>
          <select 
            value={budgetStr}
            onChange={(e) => setBudgetStr(e.target.value)}
            className="bg-bg-surface border border-border-subtle rounded-lg px-4 py-2 text-sm outline-none focus:border-accent transition-colors"
          >
            <option value="">Any Budget</option>
            <option value="10">Under 10 Lakh</option>
            <option value="20">10-20 Lakh</option>
            <option value="30">Above 20 Lakh</option>
          </select>
        </div>
      </div>
      
      {loading ? (
         <div className="flex flex-col items-center justify-center py-24 col-span-full">
            <div className="w-12 h-12 rounded-full border-2 border-accent/20 border-t-accent animate-spin mb-4" />
            <p className="text-text-secondary">Loading catalogue...</p>
         </div>
      ) : cars.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-24 text-text-secondary col-span-full bg-bg-surface rounded-xl border border-border-subtle">
           No cars found matching your filters.
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cars.map((car) => (
             <div key={car.id} onClick={() => navigate(`/cars/${car.id}`)} className="cursor-pointer transition-transform hover:-translate-y-1">
               <CarCard 
                  car={{ ...car, score: 0, reason: '' }} 
                  rank={0}
                  sessionId=""
               />
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
