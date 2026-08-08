'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/services/products';
import { useCart } from '@/components/cart/CartContext';
import { ArrowRight, Check, Plus } from 'lucide-react';

export const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      weight: product.weight,
      imageBase64: product.imageBase64,
      quantity: 1
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link href={`/pickles/${product.id}`} className="group border border-black flex flex-col bg-white h-full hover:shadow-2xl transition-shadow duration-300">
      <div className="w-full aspect-square border-b border-black overflow-hidden bg-white p-4 relative">
        
        {!product.available && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-white text-black px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 border-black shadow-[4px_4px_0_0_#000]">
              Out of Stock
            </span>
          </div>
        )}

        {product.imageBase64 ? (
          <img 
            src={product.imageBase64.startsWith('data:') ? product.imageBase64 : `data:image/png;base64,${product.imageBase64}`} 
            alt={product.name} 
            className={`w-full h-full object-contain transition-transform duration-500 ease-in-out ${product.available ? 'group-hover:scale-105' : 'opacity-60 grayscale'}`} 
          />
        ) : (
          <img 
            src="/ProductCardMango.png" 
            alt={product.name} 
            className={`w-full h-full object-contain transition-transform duration-500 ease-in-out ${product.available ? 'group-hover:scale-105' : 'opacity-60 grayscale'}`} 
          />
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-1 bg-white group-hover:bg-black group-hover:text-white transition-colors duration-200">
        <h3 className="text-2xl font-sans">{product.name}</h3>
        {product.desc && <p className="text-sm font-bold mt-1 uppercase tracking-wider">{product.desc}</p>}
        {product.description && product.description.toLowerCase() !== (product.desc || '').toLowerCase() && (
          <p className="text-sm mt-3 line-clamp-2 opacity-80 font-medium">
            {product.description}
          </p>
        )}
        
        <div className="mt-6 flex items-center justify-between font-bold text-lg">
          <span>{product.weight}</span>
          <span>₹{product.price}</span>
        </div>
        
        <div className="mt-auto pt-8">
          <button 
            onClick={(e) => {
              if (product.available) {
                handleAddToCart(e);
              } else {
                e.preventDefault();
              }
            }}
            disabled={!product.available}
            className={`w-full py-3 border text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-full transition-colors duration-200 ${
              !product.available 
                ? 'bg-black/10 text-black/40 border-black/20 cursor-not-allowed group-hover:bg-black/10 group-hover:text-black/40' 
                : 'border-black bg-white text-black group-hover:border-white group-hover:bg-black group-hover:text-white hover:!bg-white hover:!text-black hover:!border-black'
            }`}
          >
            {!product.available ? (
              <span>Out of Stock</span>
            ) : added ? (
              <span className="flex items-center gap-2">Added to cart <Check className="w-4 h-4" /></span>
            ) : (
              <span className="flex items-center gap-2">Add to cart <Plus className="w-4 h-4" /></span>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};
