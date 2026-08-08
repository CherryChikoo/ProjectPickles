'use client';

import React from 'react';
import { useSettings } from '@/components/settings/SettingsContext';

export const Logo = () => {
  const { settings } = useSettings();

  if (settings.logoUrl) {
    return (
      <img 
        src={settings.logoUrl} 
        alt={settings.storeName} 
        className="w-auto h-8 object-contain"
        onError={(e) => {
          // If the custom image fails to load, gracefully fallback to the SVG
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling;
          if (fallback) (fallback as HTMLElement).style.display = 'block';
        }}
      />
    );
  }

  return (
    <svg viewBox="0 0 256 256" fill="currentColor" className="w-6 h-6 text-black">
      <path d="M 144 256 L 27.598 256 L 144 139.598 Z" />
      <path d="M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z" />
      <path d="M 0 204.402 L 0 112 L 92.402 112 Z" />
    </svg>
  );
};
