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
                    shadow-xl border border-slate-700/30 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <Autocomplete
          multiple
          options={DEFAULT_TICKER_SYMBOLS}
          value={selectedTickers}
          onChange={(_, newValue) => setSelectedTickers(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Select tickers"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                },
                '& .MuiInputBase-input': { color: '#e2e8f0' },
              }}
            />
          )}
          className="flex-grow"
        />
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
                     text-white rounded-lg hover:shadow-lg hover:scale-105 
                     transition-all duration-200 font-medium"
        >
          Add Tickers
        </button>
      </div>
    </div>
  );
};

export default TickerInputForm; 