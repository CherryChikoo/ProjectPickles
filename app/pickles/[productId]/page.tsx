'use client';

import React, { useEffect, useState, use } from 'react';
import { getProductById, getProducts, type Product } from '@/lib/services/products';
import { ProductDetailsClient } from '@/components/products/ProductDetailsClient';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function ProductDetailsPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = use(params);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedProduct, allProducts] = await Promise.all([
          getProductById(resolvedParams.productId),
          getProducts()
        ]);
        
        setProduct(fetchedProduct);
        
        if (fetchedProduct) {
          setRelatedProducts(allProducts.filter(p => p.id !== fetchedProduct.id).slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [resolvedParams.productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-black animate-spin" />
      </div>
    );
  }
  
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

  return <ProductDetailsClient product={product} relatedProducts={relatedProducts} />;
}
