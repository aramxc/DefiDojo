import React, { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { DEFAULT_TICKER_SYMBOLS } from '../config/constants';

interface TickerInputFormProps {
  onAddTickers: (tickers: string[]) => void;
}

const TickerInputForm: React.FC<TickerInputFormProps> = ({ onAddTickers }) => {
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);

  const handleSubmit = () => {
    onAddTickers(selectedTickers);
    setSelectedTickers([]);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl 
                    shadow-xl border border-slate-700/30 backdrop-blur-sm w-full">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <Autocomplete
            multiple
            options={DEFAULT_TICKER_SYMBOLS}
            value={selectedTickers}
            onChange={(_, newValue) => setSelectedTickers(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Select tickers to track"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                  },
                  '& .MuiInputBase-input': { 
                    color: '#e2e8f0',
                    fontSize: '0.95rem',
                  },
                  '& .MuiInputBase-root': {
                    padding: '4px 8px',
                  },
                }}
              />
            )}
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 
                     text-white font-medium rounded-lg shadow-lg shadow-blue-500/25
                     hover:shadow-blue-500/40 hover:from-blue-600 hover:to-blue-700
                     transition-all duration-200 whitespace-nowrap min-w-[140px]
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Add Tickers
        </button>
      </div>
    </div>
  );
};

export default TickerInputForm; 