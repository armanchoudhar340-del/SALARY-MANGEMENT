import React, { createContext, useContext, useEffect, useState } from 'react';
import { SalarySettings } from '../types';
import { dataService } from '../lib/dataService';
import { INITIAL_SETTINGS } from '../lib/mockData';

interface SettingsContextType {
  settings: SalarySettings;
  updateSettings: (newSettings: Partial<SalarySettings>) => Promise<void>;
  isLoading: boolean;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SalarySettings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Default month: 2026-11
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');

  useEffect(() => {
    dataService.getSettings().then((data) => {
      setSettings(data);
      setIsLoading(false);
    });
  }, []);

  const updateSettings = async (newSettings: Partial<SalarySettings>) => {
    const updated = await dataService.updateSettings(newSettings);
    setSettings(updated);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        isLoading,
        selectedMonth,
        setSelectedMonth,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
