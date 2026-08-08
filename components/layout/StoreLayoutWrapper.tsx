'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const StoreLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
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
