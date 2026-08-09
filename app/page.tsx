'use client';

import { ArrowRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { getProducts, type Product } from '@/lib/services/products';
import { ProductCard } from '@/components/products/ProductCard';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { SlideUp } from '@/components/ui/motion/SlideUp';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion/Stagger';

export default function Home() {
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

  const featuredPickles = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden selection:bg-black selection:text-white">
      

      {/* HERO SECTION */}
      <section className="pt-32 sm:pt-36 md:pt-40 px-6 sm:px-10 md:px-14 pb-16 md:pb-24 max-w-[1600px] mx-auto min-h-[85vh] flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        <StaggerContainer forceAnimate className="w-full lg:w-5/12 flex flex-col items-start text-left lg:pl-12 xl:pl-20">
          <StaggerItem>
            <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.5rem] leading-[1.1] tracking-tight text-black font-normal">
              A Taste of Tradition, <br/> Made to Stay.
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="max-w-md mt-6 md:mt-8 text-base md:text-lg text-black font-medium leading-relaxed">
              Authentic, handmade pickles crafted with recipes passed down through generations. No preservatives, just pure nostalgia.
            </p>
          </StaggerItem>
          <StaggerItem>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/pickles">
                <ShimmerButton className="shadow-2xl px-8 py-4">
                  <span className="text-center text-sm font-bold tracking-tight text-white uppercase">
                    SHOP COLLECTION
                  </span>
                </ShimmerButton>
              </Link>
              <Link href="/#story" className="px-8 py-4 bg-white text-black text-sm font-bold border border-black hover:bg-black hover:text-white transition-colors duration-200 rounded-full inline-flex items-center justify-center">
                DISCOVER OUR STORY
              </Link>
            </div>
          </StaggerItem>
        </StaggerContainer>
        
        <FadeIn delay={0.3} duration={0.8} className="w-full lg:w-7/12 relative flex justify-center items-center">
          <img 
            src="/HeroSection.png" 
            alt="Traditional Pickle Jar" 
            className="w-full h-auto object-contain max-h-[80vh]"
          />
        </FadeIn>
      </section>

      {/* BRAND STORY */}
      <section id="story" className="border-t border-black px-6 sm:px-10 md:px-14 py-20 md:py-32 flex flex-col items-center text-center bg-white">
        <SlideUp>
          <h2 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight max-w-4xl font-normal text-black relative z-10">
            Some recipes aren't written down.<br/> They're passed down.
          </h2>
        </SlideUp>
        <FadeIn delay={0.2} duration={0.8} className="-mt-4 md:-mt-8 lg:-mt-12 w-full max-w-5xl relative z-0">
          <img 
            src="/BrandSection.png" 
            alt="Making pickles" 
            className="w-full h-auto object-contain"
          />
        </FadeIn>
      </section>

      {/* FEATURED PICKLES */}
      <section id="pickles" className="border-t border-black bg-white">
        <div className="px-6 sm:px-10 md:px-14 py-16 md:py-24">
          <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-12">OUR PICKLES</h2>
          
          {isLoading ? (
             <div className="py-20 text-center font-bold uppercase tracking-widest text-black/60">Loading...</div>
          ) : (
            <StaggerContainer key="products-loaded" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredPickles.map(product => (
                <StaggerItem key={product.id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="why-us" className="border-t border-black bg-white px-6 sm:px-10 md:px-14 py-16 md:py-24">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-[1600px] mx-auto">
          {[
            { num: '01', title: 'Traditional Recipes' },
            { num: '02', title: 'Quality Ingredients' },
            { num: '03', title: 'Homemade Taste' },
            { num: '04', title: 'Made With Care' }
          ].map((item, i) => (
            <StaggerItem key={i} className="p-8 md:p-12 flex flex-col items-start bg-white border border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all duration-300 cursor-default">
              <span className="text-5xl md:text-6xl font-bold text-black mb-12">{item.num}</span>
              <h3 className="text-xl md:text-2xl font-sans text-black">{item.title}</h3>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* STORY SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-2 bg-white">
        <FadeIn className="w-full h-[50vh] lg:h-auto border-b lg:border-b-0 lg:border-r border-black p-4 bg-white flex items-center justify-center">
          <img 
            src="/3rdSectionImage.png" 
            alt="From our kitchen" 
            className="w-full h-full object-contain"
          />
        </FadeIn>
        <StaggerContainer className="p-10 sm:p-16 md:p-24 flex flex-col justify-center">
          <StaggerItem>
            <h4 className="text-sm font-bold uppercase tracking-widest text-black mb-12">FROM OUR KITCHEN</h4>
          </StaggerItem>
          <StaggerItem>
            <p className="font-sans text-3xl sm:text-4xl md:text-5xl leading-tight text-black">
              Not factory-made.<br/>
              Not mass-produced.<br/>
              <br/>
              Just honest pickle,<br/>
              made the way it should be.
            </p>
          </StaggerItem>
          <StaggerItem>
            <Link href="/#story" className="mt-16 inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:pr-4 transition-all duration-300 self-start">
              DISCOVER OUR STORY <ArrowRight className="w-4 h-4" />
            </Link>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* ORDERING PROCESS */}
      <section className="border-y border-black bg-white overflow-hidden py-10 md:py-14 mt-12 md:mt-24 flex whitespace-nowrap">
        {/* We use two identical animated containers side-by-side to create a seamless loop */}
        <div className="animate-marquee flex items-center shrink-0">
          <div className="flex items-center gap-12 md:gap-24 px-6 md:px-12 shrink-0">
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">01 CHOOSE YOUR PICKLE</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">02 PLACE YOUR ORDER</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">03 WE CONFIRM</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">04 SUCCESS ORDER PLACED!!</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
          </div>
          <div className="flex items-center gap-12 md:gap-24 px-6 md:px-12 shrink-0">
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">01 CHOOSE YOUR PICKLE</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">02 PLACE YOUR ORDER</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">03 WE CONFIRM</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">04 SUCCESS ORDER PLACED!!</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
          </div>
        </div>
        <div className="animate-marquee flex items-center shrink-0">
          <div className="flex items-center gap-12 md:gap-24 px-6 md:px-12 shrink-0">
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">01 CHOOSE YOUR PICKLE</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">02 PLACE YOUR ORDER</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">03 WE CONFIRM</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">04 SUCCESS ORDER PLACED!!</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
          </div>
          <div className="flex items-center gap-12 md:gap-24 px-6 md:px-12 shrink-0">
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">01 CHOOSE YOUR PICKLE</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">02 PLACE YOUR ORDER</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">03 WE CONFIRM</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
            <span className="font-bebas text-3xl md:text-5xl uppercase tracking-widest text-black">04 SUCCESS ORDER PLACED!!</span>
            <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black shrink-0"></span>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-b border-black py-24 md:py-36 text-center px-6 bg-white overflow-hidden">
        <SlideUp>
          <h2 className="font-sans text-5xl sm:text-6xl md:text-8xl text-black">
            Ready for a taste of home?
          </h2>
        </SlideUp>
        <SlideUp delay={0.2}>
          <div className="mt-16 max-w-md mx-auto">
            <div className="flex justify-center w-full max-w-[250px] mx-auto">
              <Link href="/pickles" className="w-full">
                <ShimmerButton className="shadow-2xl px-8 py-5 w-full">
                  <span className="text-center text-sm font-bold tracking-tight text-white uppercase">
                    ORDER NOW
                  </span>
                </ShimmerButton>
              </Link>
            </div>
          </div>
        </SlideUp>
      </section>

    </div>
  );
}
