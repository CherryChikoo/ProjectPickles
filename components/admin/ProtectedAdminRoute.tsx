'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from './AdminAuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user || !isAdmin) {
        // Redirect to login, optionally preserving the intended destination
        const returnUrl = encodeURIComponent(pathname);
        router.push(`/admin/login?returnUrl=${returnUrl}`);
      }
    }
  }, [user, isAdmin, isLoading, router, pathname]);

  // Show a loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-black animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-black/60">Verifying Authorization...</p>
      </div>
    );
  }

  // If not loading and not authorized, render nothing (useEffect will redirect)
  if (!user || !isAdmin) {
    return null;
  }

  // Authorized!
  return <>{children}</>;
};
