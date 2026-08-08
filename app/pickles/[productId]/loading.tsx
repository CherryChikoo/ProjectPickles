import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function Loading() {
  return (
    <div className="max-w-[1600px] mx-auto px-6 sm:px-10 md:px-14 pt-32 sm:pt-40 md:pt-48 pb-16 md:pb-24 bg-white text-black min-h-screen">
      <Link href="/pickles" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest border-b border-black pb-1 mb-16 opacity-50 cursor-default pointer-events-none">
        <ArrowLeft className="w-4 h-4" /> Continue Shopping
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 animate-pulse">
        {/* SKELETON IMAGE */}
        <div className="w-full aspect-square border border-black/10 bg-black/5" />
        
        {/* SKELETON DETAILS */}
        <div className="flex flex-col items-start justify-center w-full">
          <div className="h-16 bg-black/10 w-3/4 mb-6" />
          
          <div className="space-y-3 mb-10 w-full max-w-lg">
            <div className="h-5 bg-black/10 w-full" />
            <div className="h-5 bg-black/10 w-5/6" />
            <div className="h-5 bg-black/10 w-4/6" />
          </div>
          
          <div className="flex items-end gap-6 mb-12">
            <div className="h-10 bg-black/10 w-32" />
            <div className="h-6 bg-black/10 w-16 pb-1" />
          </div>
          
          <div className="w-full max-w-sm mb-12">
            <div className="h-4 bg-black/10 w-24 mb-4" />
            <div className="h-14 bg-black/10 w-full border border-black/10" />
          </div>
          
          <div className="w-full max-w-sm h-14 bg-black/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
