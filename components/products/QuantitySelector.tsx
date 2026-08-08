'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

type Props = {
  quantity: number;
  onUpdate: (newQuantity: number) => void;
};

export const QuantitySelector = ({ quantity, onUpdate }: Props) => {
  return (
    <div className="flex items-center border border-black bg-white text-black w-max">
      <button 
        onClick={() => quantity > 1 && onUpdate(quantity - 1)}
        className="p-3 hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black"
        disabled={quantity <= 1}
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-12 text-center font-bold">
        {quantity}
      </div>
      <button 
        onClick={() => onUpdate(quantity + 1)}
        className="p-3 hover:bg-black hover:text-white transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
