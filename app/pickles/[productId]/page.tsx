import React from 'react';
import { getProductById, getProducts } from '@/lib/services/products';
import { ProductDetailsClient } from '@/components/products/ProductDetailsClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductDetailsPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.productId);
  
  if (!product) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-sans text-4xl mb-6">Product Not Found</h1>
        <p className="font-medium mb-12">We couldn't find the pickle you're looking for.</p>
        <Link 
          href="/pickles"
          className="px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors duration-200 rounded-full"
        >
          BACK TO COLLECTION
        </Link>
      </div>
    );
  }

  const allProducts = await getProducts();
  const relatedProducts = allProducts.filter(p => p.id !== product.id).slice(0, 4);

  return <ProductDetailsClient product={product} relatedProducts={relatedProducts} />;
}
