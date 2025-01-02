import React, { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { TICKER_SYMBOLS } from '../config/constants';

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
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-500/5" />
      
      <div className="relative p-6 rounded-xl border border-slate-700/50 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <Autocomplete
              multiple
              options={TICKER_SYMBOLS}
              value={selectedTickers}
              onChange={(_, newValue) => setSelectedTickers(newValue)}
              disableCloseOnSelect
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Select tickers to track"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(30, 41, 59, 0.5)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '0.75rem',
                      '& fieldset': { 
                        borderColor: 'rgba(148, 163, 184, 0.1)',
                        borderWidth: '1px',
                      },
                      '&:hover fieldset': { 
                        borderColor: 'rgba(59, 130, 246, 0.5)' 
                      },
                      '&.Mui-focused fieldset': { 
                        borderColor: '#3b82f6',
                        borderWidth: '1px',
                      },
                    },
                    '& .MuiInputBase-input': { 
                      color: '#e2e8f0',
                      fontSize: '0.95rem',
                      padding: '0.5rem',
                    },
                    '& .MuiChip-root': {
                      backgroundColor: 'rgba(96, 165, 250, 0.1)',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(96, 165, 250, 0.2)',
                      color: '#93c5fd',
                      '& .MuiChip-deleteIcon': {
                        color: '#93c5fd',
                        '&:hover': { color: '#3b82f6' },
                      },
                    },
                    // Style the dropdown menu
                    '& .MuiAutocomplete-popper': {
                      '& .MuiPaper-root': {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      },
                      '& .MuiAutocomplete-option': {
                        color: '#e2e8f0',
                        '&[aria-selected="true"]': {
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        },
                      },
                    },
                  }}
                />
              )}
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-3 
                     bg-gradient-to-r from-blue-500 to-blue-400
                     text-white font-medium rounded-xl shadow-lg 
                     hover:shadow-blue-500/25 backdrop-blur-sm border border-blue-500/20
                     hover:from-blue-500 hover:to-blue-400
                     transform hover:-translate-y-0.5
                     transition-all duration-200 whitespace-nowrap min-w-[140px]"
          >
            Add Tickers
          </button>
        </div>
      </div>
    </div>
  );
};

export default TickerInputForm; 