'use client';

import React from 'react';
import Link from 'next/link';
import { useSettings } from '@/components/settings/SettingsContext';

export const Footer = () => {
  const { settings } = useSettings();
  
  return (
    <footer className="bg-white text-black px-6 sm:px-10 md:px-14 py-16">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
        <div className="md:col-span-2">
          <span className="font-semibold text-2xl tracking-tight text-black uppercase block mb-6">{settings.storeName}</span>
          <p className="font-sans text-2xl leading-tight max-w-sm">
            Authentic homemade pickles,<br/>
            made with tradition.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 font-bold text-sm uppercase tracking-widest">
          <Link href="/" className="hover:underline underline-offset-4">Home</Link>
          <Link href="/pickles" className="hover:underline underline-offset-4">Pickles</Link>
          <Link href="/#story" className="hover:underline underline-offset-4">Our Story</Link>
          <Link href="/track-order" className="hover:underline underline-offset-4">Track Order</Link>
        </div>
        
        <div className="flex flex-col gap-4 font-bold text-sm uppercase tracking-widest">
          <Link href="/#contact" className="hover:underline underline-offset-4">WhatsApp</Link>
          <Link href="/#contact" className="hover:underline underline-offset-4">Phone</Link>
          <Link href="/#contact" className="hover:underline underline-offset-4">Instagram</Link>
        </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto mt-24 pt-8 border-t border-black flex flex-col sm:flex-row items-center justify-between text-sm font-medium">
        <p>© {new Date().getFullYear()} {settings.storeName}</p>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <Link href="/" className="hover:underline underline-offset-4">Privacy</Link>
          <Link href="/" className="hover:underline underline-offset-4">Terms</Link>
        </div>
      </div>
    </footer>
  );
};
