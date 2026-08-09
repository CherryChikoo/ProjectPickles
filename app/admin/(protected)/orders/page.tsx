'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getOrders, updateOrderStatus, type Order } from '@/lib/services/orders';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';
import { OrderDetailsModal } from '@/components/admin/orders/OrderDetailsModal';
import { Search, Loader2, RefreshCw } from 'lucide-react';
import { getCountFromServer, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { SlideUp } from '@/components/ui/motion/SlideUp';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion/Stagger';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'];

// In-memory cache to prevent flashing when navigating between pages
let cachedCounts: any = null;
let cachedOrdersByStatus: Record<string, any[]> = {};
let cachedLastVisibleByStatus: Record<string, any> = {};
let cachedHasMoreByStatus: Record<string, boolean> = {};

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [orders, setOrders] = useState<(Order & { id: string })[]>(cachedOrdersByStatus['ALL'] || []);
  const [loading, setLoading] = useState(!cachedOrdersByStatus['ALL']);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [lastVisible, setLastVisible] = useState<any>(cachedLastVisibleByStatus['ALL'] || null);
  const [hasMore, setHasMore] = useState(cachedHasMoreByStatus['ALL'] !== undefined ? cachedHasMoreByStatus['ALL'] : true);
  
  const [selectedOrder, setSelectedOrder] = useState<(Order & { id: string }) | null>(null);

  const [summaryCounts, setSummaryCounts] = useState(cachedCounts || {
    total: 0, pending: 0, accepted: 0, rejected: 0, completed: 0
  });
  const [countsLoading, setCountsLoading] = useState(!cachedCounts);

  const fetchOrders = async (isLoadMore = false, forceRefresh = false) => {
    try {
      if (!isLoadMore && !forceRefresh && cachedOrdersByStatus[statusFilter]) {
        setOrders(cachedOrdersByStatus[statusFilter]);
        setLastVisible(cachedLastVisibleByStatus[statusFilter]);
        setHasMore(cachedHasMoreByStatus[statusFilter]);
        setLoading(false);
        return;
      }

      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      const docToStartAfter = isLoadMore ? lastVisible : null;
      
      const { orders: fetchedOrders, lastVisible: newLastVisible } = await getOrders(
        statusFilter,
        docToStartAfter,
        15 // page size
      );

      let updatedOrders = fetchedOrders;
      if (isLoadMore) {
        updatedOrders = [...orders, ...fetchedOrders];
      }
      
      setOrders(updatedOrders);
      setLastVisible(newLastVisible);
      
      const moreAvailable = fetchedOrders.length === 15;
      setHasMore(moreAvailable);

      // Update Cache
      cachedOrdersByStatus[statusFilter] = updatedOrders;
      cachedLastVisibleByStatus[statusFilter] = newLastVisible;
      cachedHasMoreByStatus[statusFilter] = moreAvailable;
      
    } catch (err) {
      console.error(err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchSummaryCounts = async (forceRefresh = false) => {
    if (cachedCounts && !forceRefresh) {
      setSummaryCounts(cachedCounts);
      setCountsLoading(false);
      return;
    }

    try {
      setCountsLoading(true);
      const ordersRef = collection(db, 'orders');
      const [total, pending, accepted, rejected, completed] = await Promise.all([
        getCountFromServer(ordersRef),
        getCountFromServer(query(ordersRef, where('status', '==', 'PENDING'))),
        getCountFromServer(query(ordersRef, where('status', '==', 'ACCEPTED'))),
        getCountFromServer(query(ordersRef, where('status', '==', 'REJECTED'))),
        getCountFromServer(query(ordersRef, where('status', '==', 'COMPLETED')))
      ]);
      
      const newCounts = {
        total: total.data().count,
        pending: pending.data().count,
        accepted: accepted.data().count,
        rejected: rejected.data().count,
        completed: completed.data().count
      };
      
      setSummaryCounts(newCounts);
      cachedCounts = newCounts; // Update cache
    } catch (e) {
      console.error("Failed to fetch summary counts", e);
    } finally {
      setCountsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  useEffect(() => {
    fetchSummaryCounts();
  }, []);

  const handleRefresh = () => {
    fetchOrders(false, true);
    fetchSummaryCounts(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string, reason?: string) => {
    const res = await updateOrderStatus(orderId, newStatus, reason);
    if (res.success) {
      // Update local state and cache
      const updateFn = (prev: any[]) => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus, rejectionReason: reason, updatedAt: new Date() } : o
      );
      
      setOrders(updateFn);
      
      Object.keys(cachedOrdersByStatus).forEach(key => {
        cachedOrdersByStatus[key] = updateFn(cachedOrdersByStatus[key]);
      });
      
      if (selectedOrder) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus, rejectionReason: reason, updatedAt: new Date() } : null);
      }
      
      fetchSummaryCounts(true); // Force refresh counts
    } else {
      toast.error("Failed to update status.");
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
      <SlideUp className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-sans text-4xl font-bold uppercase tracking-widest mb-2">Orders Management</h1>
          <p className="text-black/60 font-bold uppercase tracking-widest text-sm">View and manage customer orders.</p>
        </div>
        <button onClick={handleRefresh} className="self-start md:self-end flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-black hover:bg-black hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${(loading || countsLoading) ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </SlideUp>
      
      {/* SUMMARY STATS */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StaggerItem className="border border-black p-4 bg-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Total Orders</div>
          <div className="text-2xl font-sans font-bold">{countsLoading ? '-' : summaryCounts.total}</div>
        </StaggerItem>
        <StaggerItem className="border border-black p-4 bg-black text-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Pending</div>
          <div className="text-2xl font-sans font-bold">{countsLoading ? '-' : summaryCounts.pending}</div>
        </StaggerItem>
        <StaggerItem className="border border-black p-4 bg-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Accepted</div>
          <div className="text-2xl font-sans font-bold">{countsLoading ? '-' : summaryCounts.accepted}</div>
        </StaggerItem>
        <StaggerItem className="border border-black p-4 bg-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Rejected</div>
          <div className="text-2xl font-sans font-bold">{countsLoading ? '-' : summaryCounts.rejected}</div>
        </StaggerItem>
        <StaggerItem className="border border-black p-4 bg-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Completed</div>
          <div className="text-2xl font-sans font-bold">{countsLoading ? '-' : summaryCounts.completed}</div>
        </StaggerItem>
      </StaggerContainer>

      {/* FILTERS & SEARCH */}
      <FadeIn delay={0.2} className="flex flex-col lg:flex-row gap-4 mb-6">
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
          {STATUS_FILTERS.map(status => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => { 
                  setStatusFilter(status); 
                  setSearchQuery(''); 
                  // Set optimistic initial state from cache if available to prevent flash
                  if (cachedOrdersByStatus[status]) {
                    setOrders(cachedOrdersByStatus[status]);
                    setLastVisible(cachedLastVisibleByStatus[status]);
                    setHasMore(cachedHasMoreByStatus[status]);
                  } else {
                    setOrders([]);
                  }
                }}
                className={`relative px-4 py-3 text-xs font-bold uppercase tracking-widest border transition-colors ${
                  isActive 
                    ? 'text-white border-black' 
                    : 'text-black border-black/20 hover:border-black hover:bg-black/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-status-filter"
                    className="absolute inset-0 bg-black z-0"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{status}</span>
              </button>
            );
          })}
        </div>
      </FadeIn>

      {error ? (
        <div className="p-6 border border-red-600 bg-red-50 text-red-900 font-bold text-center">
          <p className="mb-4">{error}</p>
          <button onClick={() => fetchOrders(false, true)} className="px-6 py-2 bg-red-600 text-white text-sm uppercase tracking-widest">Try Again</button>
        </div>
      ) : (
        <>
          <OrdersTable 
            orders={filteredOrders} 
            isLoading={loading && filteredOrders.length === 0} 
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
