'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, TrendingUp, Package, ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { SlideUp } from '@/components/ui/motion/SlideUp';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion/Stagger';

type DashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  rejectedOrders: number;
  totalProducts: number;
};

export default function AdminDashboardPage() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const ordersRef = collection(db, 'orders');
        const productsRef = collection(db, 'products');

        // Optimizing with getCountFromServer instead of fetching all documents
        const [
          totalOrdersSnap,
          pendingOrdersSnap,
          acceptedOrdersSnap,
          rejectedOrdersSnap,
          totalProductsSnap
        ] = await Promise.all([
          getCountFromServer(ordersRef),
          getCountFromServer(query(ordersRef, where('status', '==', 'PENDING'))),
          getCountFromServer(query(ordersRef, where('status', '==', 'ACCEPTED'))),
          getCountFromServer(query(ordersRef, where('status', '==', 'REJECTED'))),
          getCountFromServer(productsRef)
        ]);

        setStats({
          totalOrders: totalOrdersSnap.data().count,
          pendingOrders: pendingOrdersSnap.data().count,
          acceptedOrders: acceptedOrdersSnap.data().count,
          rejectedOrders: rejectedOrdersSnap.data().count,
          totalProducts: totalProductsSnap.data().count,
        });

      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard statistics. Ensure you have the proper permissions.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border-2 border-black bg-white text-black font-bold uppercase tracking-wider">
        {error}
      </div>
    );
  }

  return (
    <div>
      <SlideUp className="mb-10">
        <h1 className="font-sans text-4xl font-bold uppercase tracking-widest mb-2">Dashboard Overview</h1>
        <p className="text-black/60 font-bold uppercase tracking-widest text-sm">Welcome back, Admin</p>
      </SlideUp>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Orders Card */}
        <StaggerItem className="border border-black p-6 bg-white hover:bg-black/5 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-black/60 group-hover:text-black transition-colors">Total Orders</h2>
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="text-4xl font-sans font-bold">{stats?.totalOrders || 0}</div>
        </StaggerItem>

        {/* Pending Orders Card */}
        <StaggerItem className="border border-black p-6 bg-black text-white hover:bg-black/90 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Pending Orders</h2>
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-4xl font-sans font-bold">{stats?.pendingOrders || 0}</div>
        </StaggerItem>

        {/* Accepted Orders Card */}
        <StaggerItem className="border border-black p-6 bg-white hover:bg-black/5 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-black/60 group-hover:text-black transition-colors">Accepted Orders</h2>
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="text-4xl font-sans font-bold">{stats?.acceptedOrders || 0}</div>
        </StaggerItem>

        {/* Rejected Orders Card */}
        <StaggerItem className="border border-black p-6 bg-white hover:bg-black/5 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-black/60 group-hover:text-black transition-colors">Rejected Orders</h2>
            <XCircle className="w-5 h-5" />
          </div>
          <div className="text-4xl font-sans font-bold">{stats?.rejectedOrders || 0}</div>
        </StaggerItem>

        {/* Total Products Card */}
        <StaggerItem className="border border-black p-6 bg-white hover:bg-black/5 transition-colors group sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-black/60 group-hover:text-black transition-colors">Total Products</h2>
            <Package className="w-5 h-5" />
          </div>
          <div className="text-4xl font-sans font-bold">{stats?.totalProducts || 0}</div>
        </StaggerItem>
        
      </StaggerContainer>
    </div>
  );
}
