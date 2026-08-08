'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useSettings } from '../settings/SettingsContext';

export const StoreLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { settings } = useSettings();
  
  useEffect(() => {
    if (settings.storeName) {
      document.title = `${settings.storeName} - Traditional Homemade Pickles`;
    }
  }, [settings.storeName]);
  
  // Check if the current route is an admin route
  const isAdminRoute = pathname?.startsWith('/admin');

  // If it's an admin route, DO NOT render the customer Navbar or Footer
  if (isAdminRoute) {
    return <main>{children}</main>;
  }

  // Otherwise, render the standard customer layout
  return (
    <>
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
};
