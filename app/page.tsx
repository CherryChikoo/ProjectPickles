import React from 'react';
import HomeClient from '@/components/home/HomeClient';
import { getProducts } from '@/lib/services/products';

export const revalidate = 86400; // ISR: Revalidate every 24 hours to save Firebase reads

export default async function Home() {
  const products = await getProducts();
  
  return <HomeClient initialProducts={products} />;
}
