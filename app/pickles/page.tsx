import React from 'react';
import { getProducts } from '@/lib/services/products';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PicklesPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* HERO SECTION */}
      <section className="pt-32 sm:pt-40 md:pt-48 pb-20 md:pb-32 px-6 sm:px-10 md:px-14 max-w-[1600px] mx-auto border-b border-black flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        <div className="w-full lg:w-5/12 flex flex-col items-start text-left">
          <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-8">OUR COLLECTION</h2>
          <h1 className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] leading-[1.05] tracking-tight text-black font-normal max-w-4xl">
            Pickles Made<br/>With Tradition.
          </h1>
          <p className="max-w-xl mt-8 text-lg text-black font-medium leading-relaxed">
            Explore our collection of homemade pickles, prepared with traditional recipes and carefully selected ingredients.
          </p>
        </div>
        
        <div className="w-full lg:w-7/12 relative flex justify-center items-center">
          <img 
            src="/HeroSection.png" 
            alt="Pickle Collection" 
            className="w-full h-auto object-contain max-h-[60vh]"
          />
        </div>
      </section>

      {/* PRODUCT CATALOGUE */}
      <section className="px-6 sm:px-10 md:px-14 py-16 md:py-24 max-w-[1600px] mx-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-sans text-4xl text-black">ALL PICKLES</h2>
            <p className="text-black font-medium mt-2">Choose your favorites and add them to your cart.</p>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
