import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { TICKER_SYMBOLS } from '../../config/constants';

interface TickerInputFormProps {
  onAddTickers?: (tickers: { symbol: string; coingeckoId: string }[]) => void;
  onSelectTicker?: (ticker: string) => void;
  selectedTicker?: string;
  allowMultipleSelections?: boolean;
  defaultTicker?: string;
}

const TickerInputForm: React.FC<TickerInputFormProps> = ({ 
  onAddTickers,
  onSelectTicker,
  selectedTicker,
  allowMultipleSelections = true,
  defaultTicker = ''
}) => {
  const [selectedTickers, setSelectedTickers] = useState<string[]>(
    defaultTicker ? [defaultTicker] : []
  );

  useEffect(() => {
    if (defaultTicker && onSelectTicker && !selectedTicker) {
      onSelectTicker(defaultTicker);
    }
  }, [defaultTicker, onSelectTicker, selectedTicker]);

  const handleSubmit = () => {
    onAddTickers?.(selectedTickers.map(symbol => ({ symbol, coingeckoId: '' })));
    setSelectedTickers([]);
  };

  return (
    <div className="h-full w-full flex items-center">
      <div className="w-full flex flex-col sm:flex-row gap-4">
        <div className="flex-grow min-w-0">
          {allowMultipleSelections ? (
            <Autocomplete
              multiple
              options={TICKER_SYMBOLS}
              value={selectedTickers}
              onChange={(_, newValue) => setSelectedTickers(newValue)}
              defaultValue={defaultTicker ? [defaultTicker] : []}
              disableCloseOnSelect
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Select tickers to track"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: '40px',
                      background: 'rgba(30, 41, 59, 0.5)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '0.5rem',
                      padding: '3px 9px',
                      display: 'flex',
                      alignItems: 'center',
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
                      '& .MuiAutocomplete-inputRoot': {
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                      },
                      '& .MuiAutocomplete-input': {
                        padding: '0 !important',
                      },
                    },
                    '& .MuiInputBase-input': { 
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      lineHeight: '24px',
                      height: '24px',
                    },
                    '& .MuiChip-root': {
                      height: '24px',
                      margin: '2px',
                      backgroundColor: 'rgba(96, 165, 250, 0.1)',
                      borderRadius: '0.375rem',
                      border: '1px solid rgba(96, 165, 250, 0.2)',
                      color: '#93c5fd',
                      '& .MuiChip-label': {
                        padding: '0 8px',
                        lineHeight: '22px',
                      },
                      '& .MuiChip-deleteIcon': {
                        color: '#93c5fd',
                        fontSize: '1rem',
                        margin: '0 2px',
                        '&:hover': { color: '#3b82f6' },
                      },
                    },
                    '& .MuiAutocomplete-endAdornment': {
                      top: '50%',
                      transform: 'translateY(-50%)',
                      right: '9px',
                    },
                    '& .MuiAutocomplete-popper': {
                      '& .MuiPaper-root': {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                      },
                      '& .MuiAutocomplete-option': {
                        color: '#e2e8f0',
                        fontSize: '0.875rem',
                        padding: '0.5rem 0.75rem',
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
          ) : (
            <Autocomplete
              options={TICKER_SYMBOLS}
              value={selectedTicker || null}
              onChange={(_, newValue) => onSelectTicker?.(newValue || '')}
              defaultValue={defaultTicker || null}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Select a token to analyze"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: '40px',
                      background: 'rgba(30, 41, 59, 0.5)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '0.5rem',
                      padding: '3px 9px',
                      display: 'flex',
                      alignItems: 'center',
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
                      '& .MuiAutocomplete-inputRoot': {
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                      },
                      '& .MuiAutocomplete-input': {
                        padding: '0 !important',
                      },
                    },
                    '& .MuiInputBase-input': { 
                      color: '#e2e8f0',
                      fontSize: '0.875rem',
                      lineHeight: '24px',
                      height: '24px',
                    },
                    '& .MuiChip-root': {
                      height: '24px',
                      margin: '2px',
                      backgroundColor: 'rgba(96, 165, 250, 0.1)',
                      borderRadius: '0.375rem',
                      border: '1px solid rgba(96, 165, 250, 0.2)',
                      color: '#93c5fd',
                      '& .MuiChip-label': {
                        padding: '0 8px',
                        lineHeight: '22px',
                      },
                      '& .MuiChip-deleteIcon': {
                        color: '#93c5fd',
                        fontSize: '1rem',
                        margin: '0 2px',
                        '&:hover': { color: '#3b82f6' },
                      },
                    },
                    '& .MuiAutocomplete-endAdornment': {
                      top: '50%',
                      transform: 'translateY(-50%)',
                      right: '9px',
                    },
                    '& .MuiAutocomplete-popper': {
                      '& .MuiPaper-root': {
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                      },
                      '& .MuiAutocomplete-option': {
                        color: '#e2e8f0',
                        fontSize: '0.875rem',
                        padding: '0.5rem 0.75rem',
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
          )}
        </div>
        {allowMultipleSelections && (
          <button
            onClick={handleSubmit}
            className="h-10 px-4 relative rounded-lg font-medium text-sm
                     text-white transition-all duration-200
                     bg-blue-500/10 hover:bg-blue-500/20
                     border border-blue-500/20 hover:border-blue-500/30
                     flex items-center justify-center
                     whitespace-nowrap min-w-[120px]"
          >
            Add Tickers
          </button>
        )}
      </div>
    </div>
  );
};

export default TickerInputForm; 