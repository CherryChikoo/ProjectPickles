'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 text-center border-t border-black">
      <h1 className="font-sans text-[8rem] sm:text-[10rem] md:text-[12rem] leading-none tracking-tighter text-black mb-4">
        404
      </h1>
      <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-widest text-black mb-8 border-b-2 border-black pb-4 inline-block">
        Page Not Found
      </h2>
      <p className="max-w-md text-lg text-black/70 font-medium mb-12">
        We searched high and low, but couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      <Link 
        href="/"
        className="px-10 py-5 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black hover:border-black border-2 border-transparent transition-all duration-300 rounded-full shadow-[8px_8px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:translate-x-1"
      >
        BACK TO HOME
      </Link>
    </div>
  );
}
