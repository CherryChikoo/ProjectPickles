'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Settings {
  storeName: string;
  logoUrl: string | null;
  businessWhatsAppNumber?: string;
}

interface SettingsContextType {
  settings: Settings;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  storeName: 'Hema Sathya Foods',
  logoUrl: null,
  businessWhatsAppNumber: undefined,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  isLoading: true,
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to real-time changes in the global settings document
    const settingsRef = doc(db, 'settings', 'global');
    
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          storeName: data.storeName || defaultSettings.storeName,
          logoUrl: data.logoUrl || null,
          businessWhatsAppNumber: data.businessWhatsAppNumber,
        });
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching settings:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
