import React, { useEffect, useState } from 'react';
import { priceService, PriceData } from '../services/api/price.service';

export const PriceDisplay: React.FC = () => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Example symbols - replace with your actual tokens
        const symbols = ['ETH', 'BTC', 'SOL'];
        const data = await priceService.getLatestPrices(symbols);
        setPrices(data);
      } catch (error) {
        console.error('Failed to fetch prices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading prices...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {prices.map((price) => (
        <div key={price.id} className="p-4 border rounded-lg shadow">
          <h3 className="font-bold">{price.symbol}</h3>
          <p className="text-2xl">
            ${price.price?.toFixed(2) ?? 'N/A'}
          </p>
          <p className="text-sm text-gray-500">
            Confidence: {price.conf ? `${(price.conf * 100).toFixed(1)}%` : 'N/A'}
          </p>
        </div>
      ))}
    </div>
  );
};