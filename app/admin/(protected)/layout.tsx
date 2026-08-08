'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { useSettings } from '@/components/settings/SettingsContext';
import { ProtectedAdminRoute } from '@/components/admin/ProtectedAdminRoute';
import { LayoutDashboard, ShoppingBag, Package, Settings, LogOut } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/ui/motion/PageTransition';

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { signOut } = useAdminAuth();
  const { settings } = useSettings();
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen md:h-screen bg-white text-black flex flex-col md:flex-row md:overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 md:flex-shrink-0 border-b md:border-b-0 md:border-r border-black flex flex-col h-auto md:h-full">
          <div className="p-6 border-b border-black">
            <Logo />
            <div className="mt-4 font-semibold text-sm tracking-tight text-black uppercase">{settings.storeName}</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-widest text-black/60">Admin Portal</div>
          </div>
          
          <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              
              return (
                <motion.div key={item.name} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
                      isActive 
                        ? 'bg-black text-white' 
                        : 'hover:bg-black/5 text-black'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-black mt-auto">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors border border-transparent hover:border-black"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </motion.button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white p-6 md:p-10 md:overflow-y-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        
      </div>
    </ProtectedAdminRoute>
  );
}
