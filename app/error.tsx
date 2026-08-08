'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 text-center border-t border-black">
      <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mb-10 shadow-[8px_8px_0_0_rgba(0,0,0,0.1)]">
        <AlertCircle className="w-12 h-12" />
      </div>
      
      <h1 className="font-sans text-5xl sm:text-6xl md:text-7xl leading-none tracking-tight text-black mb-6">
        Oops! Something <br/> went wrong.
      </h1>
      
      <p className="max-w-md text-lg text-black/70 font-medium mb-12">
        We've encountered an unexpected error. Please try again or go back to the homepage.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-sm">
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black hover:border-black border-2 border-transparent transition-all duration-300 rounded-full text-center"
        >
          TRY AGAIN
        </button>
        <Link 
          href="/"
          className="w-full sm:w-auto px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white border-2 border-black transition-all duration-300 rounded-full text-center"
        >
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}
