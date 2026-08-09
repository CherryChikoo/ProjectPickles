'use client';

import React from 'react';
import Link from 'next/link';
import { useSettings } from '@/components/settings/SettingsContext';
import { SlideUp } from '@/components/ui/motion/SlideUp';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion/Stagger';

export const Footer = () => {
  const { settings } = useSettings();
  
  return (
    <footer className="bg-white text-black px-6 sm:px-10 md:px-14 py-16 overflow-hidden">
      <StaggerContainer className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
        <StaggerItem className="md:col-span-2">
          <span className="font-semibold text-2xl tracking-tight text-black uppercase block mb-6">{settings.storeName}</span>
          <p className="font-sans text-2xl leading-tight max-w-sm">
            Authentic homemade pickles,<br/>
            made with tradition.
          </p>
        </StaggerItem>
        
        <StaggerItem className="flex flex-col gap-4 font-bold text-sm uppercase tracking-widest">
          <Link href="/" className="hover:underline underline-offset-4">Home</Link>
          <Link href="/pickles" className="hover:underline underline-offset-4">Pickles</Link>
          <Link href="/#story" className="hover:underline underline-offset-4">Our Story</Link>
          <Link href="/track-order" className="hover:underline underline-offset-4">Track Order</Link>
        </StaggerItem>
      </StaggerContainer>
      
      <SlideUp delay={0.2} className="max-w-[1600px] mx-auto mt-24 pt-8 border-t border-black flex flex-col sm:flex-row items-center justify-between text-sm font-medium">
        <p>© {new Date().getFullYear()} {settings.storeName}</p>
      </SlideUp>
    </footer>
  );
};
