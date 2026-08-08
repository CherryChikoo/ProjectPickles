import React from 'react';
import type { Product } from '@/lib/services/products';
import { Edit2, Trash2, Power, PowerOff, PackageSearch, Loader2 } from 'lucide-react';

interface ProductsGridProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => void;
}

export function ProductsGrid({ products, isLoading, onEdit, onDelete, onToggleActive }: ProductsGridProps) {
  
  if (isLoading && products.length === 0) {
    return (
      <div className="p-12 border-2 border-black flex flex-col items-center justify-center text-center bg-white min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
        <p className="font-bold uppercase tracking-widest text-black/60 text-sm">Loading Products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 border-2 border-black border-dashed flex flex-col items-center justify-center text-center bg-white min-h-[400px]">
        <PackageSearch className="w-12 h-12 text-black/20 mb-4" />
        <h3 className="font-sans text-2xl font-bold uppercase mb-2">No Products Yet</h3>
        <p className="font-bold uppercase tracking-widest text-black/60 text-sm max-w-md mx-auto">
          You haven't added any pickles to your collection yet. Click "Add Pickle" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map(product => (
        <div key={product.id} className="border-2 border-black bg-white flex flex-col group hover:shadow-[8px_8px_0_0_#000] transition-all">
          
          {/* IMAGE */}
          <div className="aspect-[4/3] border-b-2 border-black relative overflow-hidden bg-black/5">
            <img 
              src={product.imageBase64} 
              alt={product.name} 
              className={`w-full h-full object-cover transition-opacity duration-300 ${!product.active ? 'opacity-40 grayscale' : ''}`} 
            />
            
            {/* BADGES */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
              {!product.active ? (
                <span className="bg-red-600 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-black shadow-[2px_2px_0_0_#000]">
                  Inactive
                </span>
              ) : (
                <span className="bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-black shadow-[2px_2px_0_0_#000]">
                  Active
                </span>
              )}
              
              {product.active && !product.available && (
                <span className="bg-white text-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-black shadow-[2px_2px_0_0_#000]">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* DETAILS */}
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2 gap-4">
              <h3 className={`font-sans text-xl font-bold uppercase ${!product.active ? 'text-black/60 line-through' : ''}`}>
                {product.name}
              </h3>
              <span className="font-mono font-bold text-lg whitespace-nowrap">
                ₹{product.price}
              </span>
            </div>
            
            <p className="text-sm font-medium text-black/60 line-clamp-2 mb-6 flex-1">
              {product.description || product.desc}
            </p>

            <div className="grid grid-cols-2 gap-y-3 text-xs font-bold uppercase tracking-wider border-y border-black/10 py-4 mb-6">
              <div>
                <span className="text-black/40 block mb-1">Category</span>
                {product.category || 'N/A'}
              </div>
              <div>
                <span className="text-black/40 block mb-1">Weight</span>
                {product.weight}
              </div>
              <div>
                <span className="text-black/40 block mb-1">Availability</span>
                <span className={product.available ? "text-black" : "text-red-600 line-through"}>
                  {product.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div>
                <span className="text-black/40 block mb-1">Status</span>
                <span className={product.active ? "text-black" : "text-red-600"}>
                  {product.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(product)}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest border border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={() => onToggleActive(product)}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest border border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  {product.active ? (
                    <><PowerOff className="w-4 h-4" /> Deactivate</>
                  ) : (
                    <><Power className="w-4 h-4" /> Activate</>
                  )}
                </button>
              </div>
              <button 
                onClick={() => onDelete(product)}
                className="w-full py-3 text-xs font-bold uppercase tracking-widest border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete Permanently
              </button>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}
