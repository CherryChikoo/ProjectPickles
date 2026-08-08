'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getOrders, updateOrderStatus, type Order } from '@/lib/services/orders';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';
import { OrderDetailsModal } from '@/components/admin/orders/OrderDetailsModal';
import { Search, Filter, Loader2, RefreshCw } from 'lucide-react';
import { getCountFromServer, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const STATUS_FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<(Order & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState<(Order & { id: string }) | null>(null);

  const [summaryCounts, setSummaryCounts] = useState({
    total: 0, pending: 0, accepted: 0, rejected: 0, completed: 0
  });

  const fetchOrders = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      const docToStartAfter = isLoadMore ? lastVisible : null;
      
      const { orders: fetchedOrders, lastVisible: newLastVisible } = await getOrders(
        statusFilter,
        docToStartAfter,
        15 // page size
      );

      if (isLoadMore) {
        setOrders(prev => [...prev, ...fetchedOrders]);
      } else {
        setOrders(fetchedOrders);
      }

      setLastVisible(newLastVisible);
      setHasMore(fetchedOrders.length === 15);
      
    } catch (err) {
      console.error(err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchSummaryCounts = async () => {
    try {
      const ordersRef = collection(db, 'orders');
      const [total, pending, accepted, rejected, completed] = await Promise.all([
        getCountFromServer(ordersRef),
        getCountFromServer(query(ordersRef, where('status', '==', 'PENDING'))),
        getCountFromServer(query(ordersRef, where('status', '==', 'ACCEPTED'))),
        getCountFromServer(query(ordersRef, where('status', '==', 'REJECTED'))),
        getCountFromServer(query(ordersRef, where('status', '==', 'COMPLETED')))
      ]);
      setSummaryCounts({
        total: total.data().count,
        pending: pending.data().count,
        accepted: accepted.data().count,
        rejected: rejected.data().count,
        completed: completed.data().count
      });
    } catch (e) {
      console.error("Failed to fetch summary counts", e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  useEffect(() => {
    fetchSummaryCounts();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string, reason?: string) => {
    const res = await updateOrderStatus(orderId, newStatus, reason);
    if (res.success) {
      // Update local state to reflect change without re-fetching
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus, rejectionReason: reason, updatedAt: new Date() } : o
      ));
      
      if (selectedOrder) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus, rejectionReason: reason, updatedAt: new Date() } : null);
      }
      
      fetchSummaryCounts(); // Refresh counts in background
    } else {
      alert("Failed to update status.");
    }
  };

  // Client-side search across currently loaded orders
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    
    const queryLower = searchQuery.toLowerCase();
    return orders.filter(o => 
      (o.orderId && o.orderId.toLowerCase().includes(queryLower)) ||
      o.customer.name.toLowerCase().includes(queryLower) ||
      o.customer.whatsapp.includes(queryLower)
    );
  }, [orders, searchQuery]);

  return (
    <div className="pb-10">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-sans text-4xl font-bold uppercase tracking-widest mb-2">Orders Management</h1>
          <p className="text-black/60 font-bold uppercase tracking-widest text-sm">View and manage customer orders.</p>
        </div>
        <button onClick={() => { fetchOrders(); fetchSummaryCounts(); }} className="self-start md:self-end flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-black hover:bg-black hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>
      
      {/* SUMMARY STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="border border-black p-4 bg-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Total Orders</div>
          <div className="text-2xl font-sans font-bold">{summaryCounts.total}</div>
        </div>
        <div className="border border-black p-4 bg-black text-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Pending</div>
          <div className="text-2xl font-sans font-bold">{summaryCounts.pending}</div>
        </div>
        <div className="border border-black p-4 bg-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Accepted</div>
          <div className="text-2xl font-sans font-bold">{summaryCounts.accepted}</div>
        </div>
        <div className="border border-black p-4 bg-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Rejected</div>
          <div className="text-2xl font-sans font-bold">{summaryCounts.rejected}</div>
        </div>
        <div className="border border-black p-4 bg-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Completed</div>
          <div className="text-2xl font-sans font-bold">{summaryCounts.completed}</div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
          <input 
            type="text" 
            placeholder="Search loaded orders by ID, Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pl-12 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black text-sm font-medium"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(status => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setSearchQuery(''); }}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border transition-colors ${
                statusFilter === status 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black/20 hover:border-black'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="p-6 border border-red-600 bg-red-50 text-red-900 font-bold text-center">
          <p className="mb-4">{error}</p>
          <button onClick={() => fetchOrders()} className="px-6 py-2 bg-red-600 text-white text-sm uppercase tracking-widest">Try Again</button>
        </div>
      ) : (
        <>
          <OrdersTable 
            orders={filteredOrders} 
            isLoading={loading} 
            onViewDetails={(order) => setSelectedOrder(order)} 
          />
          
          {hasMore && filteredOrders.length > 0 && !searchQuery && (
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => fetchOrders(true)}
                disabled={loadingMore}
                className="px-8 py-4 border border-black bg-white hover:bg-black hover:text-white transition-colors text-sm font-bold uppercase tracking-widest flex items-center gap-2"
              >
                {loadingMore ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Load More Orders'}
              </button>
            </div>
          )}
        </>
      )}

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
