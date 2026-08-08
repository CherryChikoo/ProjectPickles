import React, { useState } from 'react';
import { X, Check, ArrowRight, Loader2, Calendar } from 'lucide-react';
import type { Order } from '@/lib/services/orders';

export const OrderStatusBadge = ({ status }: { status: string }) => {
  let styles = "border-black text-black";
  
  if (status === 'PENDING') styles = "border-black bg-black text-white";
  else if (status === 'ACCEPTED') styles = "border-black border-2 font-bold";
  else if (status === 'COMPLETED') styles = "border-black border-dashed font-bold";
  else if (status === 'REJECTED') styles = "border-red-600 text-red-600 line-through";
  else if (status === 'CANCELLED') styles = "border-gray-400 text-gray-500 line-through";

  return (
    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border inline-block ${styles}`}>
      {status}
    </span>
  );
};

interface OrderDetailsProps {
  order: Order & { id: string };
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: string, reason?: string) => Promise<void>;
}

export function OrderDetailsModal({ order, onClose, onUpdateStatus }: OrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'REJECTED' && !showRejectReason) {
      setShowRejectReason(true);
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdateStatus(order.id, newStatus, newStatus === 'REJECTED' ? rejectReason : undefined);
      setShowRejectReason(false);
      setRejectReason('');
      onClose(); // Close modal after successful update
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-white/80 backdrop-blur-sm">
      <div className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl bg-white border-2 border-black flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
        
        {/* HEADER */}
        <div className="p-6 border-b-2 border-black flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-black/60 mb-1">Order Details</h2>
            <div className="font-sans text-2xl sm:text-3xl font-bold uppercase">{order.orderId || order.id}</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black hover:text-white transition-colors border border-transparent hover:border-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-black/20 bg-black/5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-black/60 mb-1">Current Status</p>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-black/60 mb-1">Order Date</p>
              <p className="text-sm font-bold flex items-center gap-2"><Calendar className="w-4 h-4"/> {formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* CUSTOMER DETAILS */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-2 mb-4">Customer Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-black/60 font-bold text-xs uppercase tracking-wider">Name</p>
                  <p className="font-medium text-base">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-black/60 font-bold text-xs uppercase tracking-wider">WhatsApp Number</p>
                  <p className="font-mono text-base">{order.customer.whatsapp}</p>
                </div>
              </div>
            </div>

            {/* DELIVERY DETAILS */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-2 mb-4">Delivery Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-black/60 font-bold text-xs uppercase tracking-wider">Full Address</p>
                  <p className="font-medium text-base leading-snug">{order.customer.address}</p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-black/60 font-bold text-xs uppercase tracking-wider">City</p>
                    <p className="font-medium text-base">{order.customer.city}</p>
                  </div>
                  <div>
                    <p className="text-black/60 font-bold text-xs uppercase tracking-wider">Pincode</p>
                    <p className="font-mono text-base">{order.customer.pincode}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ORDER ITEMS */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-2 mb-4">Order Items</h3>
            <div className="border border-black">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 border-b border-black/20 last:border-0">
                  <div>
                    <p className="font-bold text-base">{item.name}</p>
                    <p className="text-sm text-black/60 font-medium">{item.weight} — ₹{item.price} × {item.quantity}</p>
                  </div>
                  <div className="font-mono font-bold text-lg">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
              <div className="bg-black/5 p-4 flex justify-between items-center border-t border-black font-bold uppercase tracking-widest">
                <span>Total Amount</span>
                <span className="font-mono text-xl">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {(order as any).rejectionReason && (
            <div className="p-4 border-l-4 border-red-600 bg-red-50 text-red-900">
              <p className="text-xs font-bold uppercase tracking-widest mb-1">Rejection Reason</p>
              <p className="text-sm font-medium">{(order as any).rejectionReason}</p>
            </div>
          )}

          {/* ACTIONS */}
          <div className="border-t border-black pt-6 pb-2">
            {showRejectReason ? (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <label className="block text-sm font-bold uppercase tracking-wider">Reason for Rejection</label>
                <input 
                  type="text" 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-4 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="e.g. Product currently unavailable."
                  autoFocus
                />
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowRejectReason(false)}
                    disabled={isUpdating}
                    className="flex-1 py-4 border border-black text-sm font-bold uppercase tracking-widest hover:bg-black/5 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleStatusChange('REJECTED')}
                    disabled={isUpdating}
                    className="flex-1 py-4 bg-red-600 text-white text-sm font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Reject'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                {order.status === 'PENDING' && (
                  <>
                    <button 
                      onClick={() => setShowRejectReason(true)}
                      disabled={isUpdating}
                      className="flex-1 py-4 border border-black bg-white hover:bg-black hover:text-white transition-colors text-sm font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      Reject Order
                    </button>
                    <button 
                      onClick={() => handleStatusChange('ACCEPTED')}
                      disabled={isUpdating}
                      className="flex-1 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-4 h-4"/> Accept Order</>}
                    </button>
                  </>
                )}

                {order.status === 'ACCEPTED' && (
                  <button 
                    onClick={() => handleStatusChange('COMPLETED')}
                    disabled={isUpdating}
                    className="flex-1 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-4 h-4"/> Mark as Completed</>}
                  </button>
                )}

                {(order.status === 'COMPLETED' || order.status === 'REJECTED' || order.status === 'CANCELLED') && (
                  <div className="w-full text-center py-4 text-black/40 font-bold uppercase tracking-widest text-sm">
                    No further actions available for this order.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
