'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { getTrackedOrder, TrackedOrder } from '@/lib/actions/tracking';
import { OrderTrackingTimeline } from '@/components/shared/OrderTrackingTimeline';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderId, setOrderId] = useState(initialOrderId);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  
  // Auto-fetch if orderId is in URL on load
  useEffect(() => {
    if (initialOrderId) {
      handleTrack(initialOrderId);
    }
  }, [initialOrderId]);

  const handleTrack = async (idToTrack: string) => {
    if (!idToTrack.trim()) {
      setError('Please enter an Order ID');
      return;
    }

    setIsTracking(true);
    setError(null);
    setOrder(null);

    // Update URL without reload so it can be shared
    if (idToTrack !== initialOrderId) {
      router.replace(`/track-order?orderId=${encodeURIComponent(idToTrack.trim())}`);
    }

    const result = await getTrackedOrder(idToTrack);

    if (result.success && result.order) {
      setOrder(result.order);
    } else {
      setError(result.error || 'ORDER NOT FOUND');
    }
    
    setIsTracking(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack(orderId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-white text-black pt-32 sm:pt-40 md:pt-48 pb-16 px-6 max-w-4xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="font-sans text-5xl md:text-6xl mb-4 uppercase">Track Your Order</h1>
        <p className="text-lg font-medium text-black/60">Enter your order ID to check your order status.</p>
      </div>

      {/* Search Form */}
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-4 mb-16 max-w-2xl mx-auto">
        <div className="flex-1 relative">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value.toUpperCase())}
            placeholder="e.g. PKL-20260809-XXXX"
            className="w-full p-5 pl-12 border-2 border-black bg-white focus:outline-none focus:ring-1 focus:ring-black font-mono text-lg uppercase"
          />
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-black/50" />
        </div>
        <button
          type="submit"
          disabled={isTracking || !orderId.trim()}
          className="py-5 px-8 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black border-2 border-black transition-colors duration-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-white"
        >
          {isTracking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'TRACK ORDER'}
        </button>
      </form>

      {/* States */}
      {isTracking && (
        <div className="text-center py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="font-bold uppercase tracking-widest">Tracking Order...</p>
        </div>
      )}

      {error && !isTracking && (
        <div className="border-2 border-black p-12 text-center bg-black/5">
          <XCircle className="w-16 h-16 mx-auto mb-6 opacity-20" />
          <h2 className="text-2xl font-bold uppercase tracking-widest mb-2">{error}</h2>
          <p className="text-black/60 font-medium mb-8">Please check your order ID and try again.</p>
          <button 
            onClick={() => {
              setOrderId('');
              setError(null);
            }}
            className="text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-black/60 hover:border-black/60 transition-colors"
          >
            TRY ANOTHER ORDER ID
          </button>
        </div>
      )}

      {order && !isTracking && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16">
          
          {/* Timeline side */}
          <div className="md:col-span-2 border-2 border-black p-8 md:p-10">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-4 mb-8">Order Status</h2>
            <OrderTrackingTimeline status={order.status} rejectionReason={order.rejectionReason} />
          </div>
          
          {/* Details side */}
          <div className="md:col-span-3">
            <div className="border-2 border-black p-8 md:p-10 mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-4 mb-8">Order Summary</h2>
              
              <div className="grid grid-cols-2 gap-y-6 mb-8 text-base">
                <div>
                  <p className="text-black/60 font-bold text-xs uppercase tracking-wider mb-1">Order ID</p>
                  <p className="font-mono font-bold">{order.orderId}</p>
                </div>
                <div>
                  <p className="text-black/60 font-bold text-xs uppercase tracking-wider mb-1">Order Date</p>
                  <p className="font-bold">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-black/60 font-bold text-xs uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-bold">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-black/60 font-bold text-xs uppercase tracking-wider mb-1">Total</p>
                  <p className="font-bold">₹{formatPrice(order.totalAmount)}</p>
                </div>
              </div>

              <div className="border-t border-black pt-8">
                <p className="text-black/60 font-bold text-xs uppercase tracking-wider mb-4">Items Ordered</p>
                <div className="flex flex-col gap-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-black/60">{item.weight} &times; {item.quantity}</p>
                      </div>
                      <p className="font-bold">₹{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Link 
              href="/pickles"
              className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:pl-2 transition-all"
            >
              CONTINUE SHOPPING <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
        </div>
      )}
    </div>
  );
}

// Separate component for the XCircle icon since it wasn't imported from lucide-react initially
function XCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-32 pb-16">
        <Loader2 className="w-12 h-12 text-black animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
