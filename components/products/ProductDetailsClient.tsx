'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/services/products';
import { useCart } from '@/components/cart/CartContext';
import { QuantitySelector } from '@/components/products/QuantitySelector';
import { ArrowLeft, Check } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';

export const ProductDetailsClient = ({ product, relatedProducts = [] }: { product: Product, relatedProducts?: Product[] }) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      weight: product.weight,
      imageBase64: product.imageBase64,
      quantity
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 sm:px-10 md:px-14 pt-32 sm:pt-40 md:pt-48 pb-16 md:pb-24 bg-white text-black min-h-screen">
      <Link href="/pickles" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:pr-2 transition-all mb-16">
        <ArrowLeft className="w-4 h-4" /> Continue Shopping
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* IMAGE */}
        <div className="w-full aspect-square border border-black p-8 flex items-center justify-center bg-white">
          {product.imageBase64 ? (
            <img 
              src={product.imageBase64.startsWith('data:') ? product.imageBase64 : `data:image/png;base64,${product.imageBase64}`} 
              alt={product.name} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full border border-dashed border-black/20 flex items-center justify-center font-bold uppercase">
              No Image
            </div>
          )}
        </div>
        
        {/* DETAILS */}
        <div className="flex flex-col items-start justify-center">
          <h1 className="font-sans text-5xl md:text-6xl mb-6">{product.name}</h1>
          <p className="text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-lg">
            {product.description || product.desc || "Traditional homemade pickle."}
          </p>
          
          {product.ingredients && (
            <div className="mb-10">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Ingredients</h3>
              <p className="font-medium text-black/80">{product.ingredients}</p>
            </div>
          )}
          
          <div className="flex items-end gap-6 mb-12">
            <div className="font-bold text-4xl">{product.price}</div>
            <div className="font-bold text-xl text-black/60 pb-1">{product.weight}</div>
          </div>
          
          <div className="w-full max-w-sm mb-12">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Quantity</h3>
            <QuantitySelector quantity={quantity} onUpdate={setQuantity} />
          </div>
          
          {product.available ? (
            <button 
              onClick={handleAddToCart}
              className="w-full max-w-sm py-4 bg-black text-white text-sm font-bold uppercase tracking-widest border border-black hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 rounded-full"
            >
              {added ? (
                <>Added to Cart <Check className="w-5 h-5" /></>
              ) : (
                'ADD TO CART'
              )}
            </button>
          ) : (
            <div className="w-full max-w-sm py-4 bg-white text-black/50 border border-black/20 text-sm font-bold uppercase tracking-widest flex items-center justify-center rounded-full cursor-not-allowed">
              CURRENTLY UNAVAILABLE
            </div>
          )}
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-16 border-t border-black">
          <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-12">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
