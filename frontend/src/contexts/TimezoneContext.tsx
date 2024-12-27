import React, { createContext, useContext, useState } from 'react';

export type TimezoneOption = {
  label: string;
  value: string;
  abbrev: string;
};

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { label: 'Eastern', value: 'America/New_York', abbrev: 'ET' },
  { label: 'Central', value: 'America/Chicago', abbrev: 'CT' },
  { label: 'Mountain', value: 'America/Denver', abbrev: 'MT' },
  { label: 'Pacific', value: 'America/Los_Angeles', abbrev: 'PT' },
  { label: 'UTC', value: 'UTC', abbrev: 'UTC' },
];

type TimezoneContextType = {
  selectedTimezone: TimezoneOption;
  setTimezone: (timezone: TimezoneOption) => void;
};

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export const TimezoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTimezone, setSelectedTimezone] = useState<TimezoneOption>(
    // Default to Mountain Time
    TIMEZONE_OPTIONS.find(tz => tz.value === 'America/Denver') || TIMEZONE_OPTIONS[0]
  );

  return (
    <TimezoneContext.Provider 
      value={{ 
        selectedTimezone, 
        setTimezone: setSelectedTimezone 
      }}
    >
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};