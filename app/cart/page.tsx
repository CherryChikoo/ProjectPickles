'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartContext';
import { QuantitySelector } from '@/components/products/QuantitySelector';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { SlideUp } from '@/components/ui/motion/SlideUp';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion/Stagger';

export default function CartPage() {
  const { items, updateQuantity, removeItem, cartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 text-center border-t border-black">
        <SlideUp>
          <h1 className="font-sans text-5xl md:text-6xl mb-6">Your cart is empty.</h1>
        </SlideUp>
        <FadeIn delay={0.1}>
          <p className="text-lg font-medium mb-12">Explore our pickle collection and find something you love.</p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <Link 
            href="/pickles"
            className="px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors duration-200 rounded-full flex items-center gap-2"
          >
            EXPLORE PICKLES <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black px-6 sm:px-10 md:px-14 pt-32 sm:pt-40 md:pt-48 pb-16 md:pb-24 max-w-[1600px] mx-auto">
      <SlideUp>
        <h1 className="font-sans text-5xl md:text-6xl mb-16">Your Cart</h1>
      </SlideUp>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <StaggerContainer className="lg:col-span-2 flex flex-col gap-8">
          {items.map(item => (
            <StaggerItem key={item.productId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-black p-6 gap-6">
              <div className="flex flex-row items-center gap-6 w-full sm:w-auto">
                <div className="w-24 h-24 sm:w-32 sm:h-32 border border-black p-2 flex-shrink-0 bg-white">
                  {item.imageBase64 ? (
                    <img 
                      src={item.imageBase64.startsWith('data:') ? item.imageBase64 : `data:image/png;base64,${item.imageBase64}`} 
                      alt={item.name} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-xs font-bold uppercase border border-dashed border-black/20">
                      No Img
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-sans text-2xl sm:text-3xl mb-1">{item.name}</h3>
                  <p className="text-sm font-bold uppercase text-black/60 mb-2">{item.weight}</p>
                  <p className="font-bold text-xl">{item.price}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between w-full sm:w-auto gap-8 sm:gap-12 mt-4 sm:mt-0">
                <QuantitySelector 
                  quantity={item.quantity} 
                  onUpdate={(newQuantity) => updateQuantity(item.productId, newQuantity)} 
                />
                <button 
                  onClick={() => removeItem(item.productId)}
                  className="p-3 hover:bg-black hover:text-white border border-transparent hover:border-black transition-colors rounded-full text-black/60 hover:text-white"
                  title="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
        
        <FadeIn delay={0.2} className="lg:col-span-1 border border-black p-8 h-max sticky top-32">
          <h2 className="font-sans text-3xl mb-8">Summary</h2>
          
          <div className="flex justify-between items-center mb-6 font-bold text-lg">
            <span>Subtotal</span>
            <span>₹{formatPrice(cartTotal)}</span>
          </div>
          <div className="flex justify-between items-center mb-10 text-sm font-medium text-black/60">
            <span>Shipping</span>
            <span>Calculated at next step</span>
          </div>
          
          <div className="flex justify-between items-center mb-10 font-bold text-2xl pt-6 border-t border-black">
            <span>Total</span>
            <span>₹{formatPrice(cartTotal)}</span>
          </div>
          
          <Link href="/order" className="w-full py-5 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors duration-200 rounded-full flex items-center justify-center text-center">
            PROCEED TO ORDER
          </Link>
        </FadeIn>
      </div>
    </div>
  );
}
