import React, { createContext, useContext, useState } from 'react';

export type TimezoneOption = {
  label: string;
  value: string;
  offset: string;
};

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { label: 'UTC', value: 'UTC', offset: 'UTC+0' },
  { label: 'ET', value: 'America/New_York', offset: 'UTC-5' },
  { label: 'CT', value: 'America/Chicago', offset: 'UTC-6' },
  { label: 'MT', value: 'America/Denver', offset: 'UTC-7' },
  { label: 'PT', value: 'America/Los_Angeles', offset: 'UTC-8' },
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