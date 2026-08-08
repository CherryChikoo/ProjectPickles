'use client';

import React from 'react';
import Link from 'next/link';
import { ShimmerButton } from "@/components/magicui/shimmer-button";

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
      
      <Link href="/">
        <ShimmerButton className="shadow-2xl px-10 py-5">
          <span className="text-center text-sm font-bold tracking-tight text-white uppercase">
            BACK TO HOME
          </span>
        </ShimmerButton>
      </Link>
      
      <style dangerouslySetInnerHTML={{ __html: `
        nav, footer { display: none !important; }
      `}} />
    </div>
  );
}
