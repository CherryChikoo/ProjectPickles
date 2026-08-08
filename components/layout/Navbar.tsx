'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { useCart } from '@/components/cart/CartContext';

import { useSettings } from '@/components/settings/SettingsContext';

export const Navbar = () => {
  const { cartCount } = useCart();
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 md:px-14 py-4 sm:py-5 flex items-center justify-between bg-white border-b border-black">
      <Link href="/" className="flex items-center gap-2.5">
        <Logo />
        <span className="font-semibold text-lg tracking-tight text-black uppercase">{settings.storeName}</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8 font-medium">
        <Link href="/" className="text-sm text-black hover:underline underline-offset-4">Home</Link>
        <Link href="/pickles" className="text-sm text-black hover:underline underline-offset-4">Pickles</Link>
        <Link href="/#story" className="text-sm text-black hover:underline underline-offset-4">Our Story</Link>
        <Link href="/#contact" className="text-sm text-black hover:underline underline-offset-4">Contact</Link>
      </div>
      
      <Link href="/cart" className="px-6 py-2.5 bg-black text-white text-sm font-bold tracking-tight uppercase hover:bg-white hover:text-black hover:border-black border border-transparent transition-colors duration-200">
        Cart ({mounted ? cartCount : 0})
      </Link>
    </nav>
  );
};
