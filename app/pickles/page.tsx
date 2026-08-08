'use client';

import React, { useEffect, useState } from 'react';
import { getProducts, type Product } from '@/lib/services/products';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { SlideUp } from '@/components/ui/motion/SlideUp';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion/Stagger';

export default function PicklesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* HERO SECTION */}
      <section className="pt-32 sm:pt-36 md:pt-40 pb-20 md:pb-32 px-6 sm:px-10 md:px-14 max-w-[1600px] mx-auto border-b border-black flex flex-col md:flex-row items-center min-h-[75vh] gap-12 lg:gap-20">
        <StaggerContainer className="w-full lg:w-5/12 flex flex-col items-start text-left lg:pl-8 xl:pl-12">
          <StaggerItem>
            <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-8">OUR COLLECTION</h2>
          </StaggerItem>
          <StaggerItem>
            <h1 className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] leading-[1.05] tracking-tight text-black font-normal max-w-4xl">
              Pickles Made<br/>With Tradition.
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="max-w-xl mt-8 text-lg text-black font-medium leading-relaxed">
              Explore our collection of homemade pickles, prepared with traditional recipes and carefully selected ingredients.
            </p>
          </StaggerItem>
        </StaggerContainer>
        
        <FadeIn delay={0.2} duration={0.8} className="w-full lg:w-7/12 relative flex justify-center items-center">
          <img 
            src="/PicklesPage.png" 
            alt="Pickle Collection" 
            className="w-full h-auto object-contain max-h-[60vh]"
          />
        </FadeIn>
      </section>

      {/* PRODUCT CATALOGUE */}
      <section className="px-6 sm:px-10 md:px-14 py-16 md:py-24 max-w-[1600px] mx-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SlideUp>
            <h2 className="font-sans text-4xl text-black">ALL PICKLES</h2>
            <p className="text-black font-medium mt-2">Choose your favorites and add them to your cart.</p>
          </SlideUp>
        </div>

        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
            <p className="text-black font-bold uppercase tracking-widest text-sm">Loading Collection...</p>
          </div>
        ) : products.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map(product => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center border border-black border-dashed">
            <p className="font-sans text-3xl mb-4 text-black">Our pickle collection is being prepared.</p>
            <p className="text-black font-medium mb-12">Please check back soon.</p>
            <Link 
              href="/"
              className="px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors duration-200 rounded-full"
            >
              BACK HOME
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
