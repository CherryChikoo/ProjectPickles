import './globals.css';
import type { Metadata } from 'next';
import { StoreLayoutWrapper } from '@/components/layout/StoreLayoutWrapper';
import { CartProvider } from '@/components/cart/CartContext';
import { SettingsProvider } from '@/components/settings/SettingsContext';

export const metadata: Metadata = {
  title: 'Hema Sathya Foods - Traditional Homemade Pickles',
  description: 'Authentic, handmade pickles crafted with recipes passed down through generations. No preservatives, just pure nostalgia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://db.onlinewebfonts.com/c/9d4d074c9335825a23cce178ee03b498?family=P22+Mackinac+W01+Book" rel="stylesheet" type="text/css"/>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SettingsProvider>
          <CartProvider>
            <StoreLayoutWrapper>
              {children}
            </StoreLayoutWrapper>
          </CartProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
