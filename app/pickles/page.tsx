import React from 'react';
import PicklesClient from '@/components/products/PicklesClient';
import { getProducts } from '@/lib/services/products';

export const revalidate = 86400; // ISR: Revalidate every 24 hours to save Firebase reads

export default async function PicklesPage() {
  const products = await getProducts();
  
  return <PicklesClient initialProducts={products} />;
}
