import React from 'react';
import type { Order } from '@/lib/services/orders';
import { OrderStatusBadge } from './OrderDetailsModal';
import { FileText, Loader2 } from 'lucide-react';

interface OrdersTableProps {
  orders: (Order & { id: string })[];
  isLoading: boolean;
  onViewDetails: (order: Order & { id: string }) => void;
}

export function OrdersTable({ orders, isLoading, onViewDetails }: OrdersTableProps) {
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).format(date);
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="p-12 border-2 border-black flex flex-col items-center justify-center text-center bg-white min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
        <p className="font-bold uppercase tracking-widest text-black/60 text-sm">Loading Orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 border-2 border-black border-dashed flex flex-col items-center justify-center text-center bg-white min-h-[400px]">
        <FileText className="w-12 h-12 text-black/20 mb-4" />
        <h3 className="font-sans text-2xl font-bold uppercase mb-2">No Orders Yet</h3>
        <p className="font-bold uppercase tracking-widest text-black/60 text-sm">Customer orders will appear here once they are placed.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto border-2 border-black bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-black/5">
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/60 whitespace-nowrap">Order ID</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/60">Customer</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/60">Items</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/60 whitespace-nowrap">Total</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/60">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/60 whitespace-nowrap">Date</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-black/60 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-black/20 hover:bg-black/5 transition-colors group">
                <td className="p-4 font-sans font-bold whitespace-nowrap">{order.orderId || order.id.substring(0,8)}</td>
                <td className="p-4">
                  <div className="font-bold">{order.customer.name}</div>
                  <div className="text-xs text-black/60 font-mono mt-1">{order.customer.whatsapp}</div>
                </td>
                <td className="p-4 font-medium text-sm">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </td>
                <td className="p-4 font-mono font-bold whitespace-nowrap">₹{order.totalAmount}</td>
                <td className="p-4 whitespace-nowrap">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="p-4 font-medium text-sm whitespace-nowrap">{formatDate(order.createdAt)}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => onViewDetails(order)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-black hover:bg-black hover:text-white transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden flex flex-col gap-4">
        {orders.map((order) => (
          <div key={order.id} className="border-2 border-black p-4 bg-white flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-sans font-bold text-lg">{order.orderId || order.id.substring(0,8)}</div>
                <div className="text-xs text-black/60 font-bold uppercase tracking-wider mt-1">{formatDate(order.createdAt)}</div>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            
            <div className="border-y border-black/10 py-3 my-1">
              <div className="font-bold mb-1">{order.customer.name}</div>
              <div className="text-sm font-medium flex justify-between">
                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                <span className="font-mono font-bold">₹{order.totalAmount}</span>
              </div>
            </div>
            
            <button 
              onClick={() => onViewDetails(order)}
              className="w-full py-3 text-xs font-bold uppercase tracking-widest border border-black hover:bg-black hover:text-white transition-colors text-center"
            >
              View Order Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
