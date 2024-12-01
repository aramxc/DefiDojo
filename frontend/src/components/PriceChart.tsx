import React, { useEffect, useState } from 'react';
import { priceService, PriceData } from '../services/api/price.service';
import { Line } from 'react-chartjs-2';

export const PriceChart: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [history, setHistory] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await priceService.getPriceHistory(symbol, 30); // 30 days
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch price history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [symbol]);

  if (loading) return <div>Loading chart...</div>;

  const chartData = {
    labels: history.map(item => new Date(item.timestamp).toLocaleDateString()),
    datasets: [{
      label: `${symbol} Price`,
      data: history.map(item => item.price),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  return (
    <div className="w-full h-[400px] p-4">
      <Line data={chartData} options={{
        responsive: true,
        maintainAspectRatio: false,
      }} />
    </div>
  );
};