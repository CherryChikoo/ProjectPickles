import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { processImage } from '@/lib/utils/image-processor';
import type { Product } from '@/lib/services/products';

interface ProductFormModalProps {
  initialData?: Product | null;
  onClose: () => void;
  onSave: (data: Omit<Product, 'id'>) => Promise<boolean>;
}

export function ProductFormModal({ initialData, onClose, onSave }: ProductFormModalProps) {
  const isEditing = !!initialData;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || initialData?.desc || '');
  const [ingredients, setIngredients] = useState(
    initialData?.ingredients 
      ? (Array.isArray(initialData.ingredients) ? initialData.ingredients.join('\n') : initialData.ingredients) 
      : ''
  );
  const [category, setCategory] = useState(initialData?.category || '');
  const [weight, setWeight] = useState(initialData?.weight || '');
  const [price, setPrice] = useState<string>(
    initialData?.price ? String(initialData.price).replace('₹', '') : ''
  );
  
  const [imageBase64, setImageBase64] = useState(initialData?.imageBase64 || '');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const [available, setAvailable] = useState(initialData ? initialData.available : true);
  const [active, setActive] = useState(initialData ? initialData.active : true);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      setError(null);
      const base64 = await processImage(file);
      setImageBase64(base64);
    } catch (err: any) {
      setError(err.message || 'Failed to process image');
      // Reset file input
      e.target.value = '';
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) return setError('Product name is required');
    if (!description.trim()) return setError('Description is required');
    if (!weight.trim()) return setError('Weight is required');
    
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return setError('Price must be a valid number greater than 0');
    }
    
    if (!imageBase64) return setError('Product image is required');

    // Prepare data
    // The existing db stores ingredients as an array in some places, or a string. 
    // The instructions say: "Allow multiple ingredients. Example: Raw Mango\nRed Chilli"
    const ingredientsArray = ingredients.split('\n').map(i => i.trim()).filter(i => i.length > 0);
    
    const productData: Omit<Product, 'id'> = {
      name: name.trim(),
      desc: description.trim(),
      description: description.trim(), // keeping both just in case existing frontend relies on 'desc'
      ingredients: ingredientsArray as any, // Storing as array
      category: category.trim(),
      weight: weight.trim(),
      price: parsedPrice.toString(), // Store just the number as a string or number based on schema. Schema requested number, but existing uses "₹250". Wait, instruction says: "Store as a number, not a formatted string."
      imageBase64,
      available,
      active,
    };

    // Correct price format based on instructions: "Store as a number, not a formatted string."
    (productData as any).price = parsedPrice; 

    try {
      setLoading(true);
      const success = await onSave(productData);
      if (success) {
        onClose();
      } else {
        setError('Failed to save product. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center bg-white/80 backdrop-blur-sm p-0 sm:p-6 overflow-hidden">
      <div className="w-full h-[90vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl bg-white border-2 border-black flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
        
        {/* HEADER */}
        <div className="p-6 border-b-2 border-black flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="font-sans text-2xl font-bold uppercase">{isEditing ? 'Edit Pickle' : 'Add New Pickle'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black hover:text-white transition-colors border border-transparent hover:border-black">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* FORM BODY */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 border border-red-600 bg-red-50 text-red-900 text-sm font-bold tracking-wide uppercase">
              {error}
            </div>
          )}

          <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* NAME */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Product Name *</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Mango Pickle"
                className="w-full p-4 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Description *</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Traditional homemade mango pickle..."
                className="w-full p-4 border border-black focus:outline-none focus:ring-1 focus:ring-black min-h-[100px] resize-y"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* WEIGHT */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Weight *</label>
                <input 
                  type="text" 
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="e.g. 500g"
                  className="w-full p-4 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              {/* PRICE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Price (₹) *</label>
                <input 
                  type="number" 
                  min="1"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="250"
                  className="w-full p-4 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* CATEGORY */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Category</label>
                <input 
                  type="text" 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="e.g. Mango"
                  className="w-full p-4 border border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              {/* INGREDIENTS */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Ingredients (One per line)</label>
                <textarea 
                  value={ingredients}
                  onChange={e => setIngredients(e.target.value)}
                  placeholder="Raw Mango&#10;Red Chilli&#10;Mustard"
                  className="w-full p-4 border border-black focus:outline-none focus:ring-1 focus:ring-black min-h-[100px] resize-y"
                />
              </div>
            </div>

            {/* IMAGE UPLOAD */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Product Image * (JPEG, PNG, WEBP)</label>
              
              <div className="border-2 border-black border-dashed p-4 flex flex-col items-center justify-center gap-4 bg-black/5 hover:bg-black/10 transition-colors relative cursor-pointer min-h-[200px]">
                {isProcessingImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-black/40" />
                    <span className="text-xs font-bold uppercase tracking-widest">Processing Image...</span>
                  </div>
                ) : imageBase64 ? (
                  <div className="w-full h-full flex flex-col items-center">
                    <img src={imageBase64} alt="Preview" className="max-h-[200px] object-contain mb-4 border border-black" />
                    <span className="text-xs font-bold uppercase tracking-widest bg-white border border-black px-4 py-2">Change Image</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-black/60 pointer-events-none">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-widest text-center">Click to select image<br/>(Max 5MB)</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp, image/jpg"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>

            {/* STATUS TOGGLES */}
            <div className="border-t border-black pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* ACTIVE STATUS */}
              <div className="flex items-start gap-4 p-4 border border-black bg-white">
                <input 
                  type="checkbox" 
                  id="activeToggle"
                  checked={active}
                  onChange={e => setActive(e.target.checked)}
                  className="w-6 h-6 border-2 border-black accent-black shrink-0 mt-0.5 cursor-pointer"
                />
                <div>
                  <label htmlFor="activeToggle" className="block text-sm font-bold uppercase tracking-widest cursor-pointer">Active Status</label>
                  <p className="text-xs text-black/60 mt-1">If unchecked, the product is hidden from customers entirely.</p>
                </div>
              </div>

              {/* AVAILABLE STATUS */}
              <div className="flex items-start gap-4 p-4 border border-black bg-white">
                <input 
                  type="checkbox" 
                  id="availableToggle"
                  checked={available}
                  onChange={e => setAvailable(e.target.checked)}
                  className="w-6 h-6 border-2 border-black accent-black shrink-0 mt-0.5 cursor-pointer"
                />
                <div>
                  <label htmlFor="availableToggle" className="block text-sm font-bold uppercase tracking-widest cursor-pointer">Available (In Stock)</label>
                  <p className="text-xs text-black/60 mt-1">If unchecked, customers can see it but cannot add it to cart.</p>
                </div>
              </div>

            </div>

          </form>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-6 border-t-2 border-black flex gap-4 shrink-0 bg-white">
          <button 
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-4 border border-black text-sm font-bold uppercase tracking-widest hover:bg-black/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="productForm"
            disabled={loading || isProcessingImage}
            className="flex-1 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Pickle'}
          </button>
        </div>

      </div>
    </div>
  );
}
