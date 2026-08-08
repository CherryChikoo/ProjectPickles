'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const total = searchParams.get('total');

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center pt-32 sm:pt-40 md:pt-48 pb-16 px-6 text-center max-w-2xl mx-auto">
      <CheckCircle2 className="w-24 h-24 mb-8 text-black" />
      <h1 className="font-sans text-5xl md:text-6xl mb-6 uppercase">Order Received</h1>
      
      <p className="text-lg font-medium mb-12">
        Your order has been successfully submitted.
      </p>
      
      <div className="w-full border border-black p-8 text-left mb-12">
        <div className="grid grid-cols-2 gap-y-6 text-lg">
          <div className="text-black/60 font-bold uppercase tracking-widest text-sm">Order ID</div>
          <div className="font-bold font-sans">{orderId || 'PENDING...'}</div>
          
          <div className="text-black/60 font-bold uppercase tracking-widest text-sm">Status</div>
          <div className="font-bold">PENDING</div>
          
          <div className="text-black/60 font-bold uppercase tracking-widest text-sm">Total</div>
          <div className="font-bold">₹{total || '0'}</div>
        </div>
      </div>
      
      <p className="text-base font-bold italic mb-12 opacity-80">
        Our team will review your order and confirm it shortly.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Link 
          href="/pickles"
          className="flex-1 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors duration-200 flex justify-center items-center gap-2 rounded-full"
        >
          CONTINUE SHOPPING <ArrowRight className="w-4 h-4" />
        </Link>
        
        <Link 
          href="/"
          className="flex-1 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white border border-black transition-colors duration-200 flex justify-center items-center rounded-full"
        >
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-32 pb-16">
        <Loader2 className="w-12 h-12 text-black animate-spin" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
