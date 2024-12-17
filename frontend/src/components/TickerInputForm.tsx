import React, { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { DEFAULT_TICKER_SYMBOLS } from '../config/constants';

interface TickerInputFormProps {
  onAddTickers: (tickers: string[]) => void;
}

const TickerInputForm: React.FC<TickerInputFormProps> = ({ onAddTickers }) => {
  const [inputValue, setInputValue] = useState<string[]>([]);

  const handleAddTickers = () => {
    onAddTickers(inputValue);
    setInputValue([]);
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-slate-800 rounded-lg shadow-md">
      <Autocomplete
        multiple
        options={DEFAULT_TICKER_SYMBOLS}
        value={inputValue}
        onChange={(event, newValue) => setInputValue(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Select tickers"
            className="bg-slate-700 text-gray-300 focus:outline-none"
          />
        )}
        className="flex-grow"
      />
      <button
        onClick={handleAddTickers}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Add
      </button>
    </div>
  );
};

export default TickerInputForm; 