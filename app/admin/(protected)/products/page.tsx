'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getAdminProducts, createProduct, updateProduct, deleteProduct, type Product } from '@/lib/services/products';
import { ProductsGrid } from '@/components/admin/products/ProductsGrid';
import { ProductFormModal } from '@/components/admin/products/ProductFormModal';
import { DeleteConfirmDialog } from '@/components/admin/products/DeleteConfirmDialog';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { SlideUp } from '@/components/ui/motion/SlideUp';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion/Stagger';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'INACTIVE', 'AVAILABLE', 'UNAVAILABLE'];

// In-memory cache to prevent flashing when navigating between pages
let cachedProducts: Product[] | null = null;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(cachedProducts || []);
  const [loading, setLoading] = useState(!cachedProducts);
  const [error, setError] = useState<string | null>(null);
  
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const fetchProducts = async (forceRefresh = false) => {
    if (cachedProducts && !forceRefresh) {
      setProducts(cachedProducts);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await getAdminProducts();
      setProducts(fetchedProducts);
      cachedProducts = fetchedProducts;
    } catch (err) {
      console.error(err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = () => {
    fetchProducts(true);
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      if (selectedProduct) {
        // Edit Mode
        const res = await updateProduct(selectedProduct.id, productData);
        if (res.success) {
          const updatedProduct = { ...productData, id: selectedProduct.id } as Product;
          const newProducts = products.map(p => p.id === selectedProduct.id ? updatedProduct : p);
          setProducts(newProducts);
          cachedProducts = newProducts;
          return true;
        }
      } else {
        // Create Mode
        const res = await createProduct(productData);
        if (res.success && res.id) {
          const newProduct = { ...productData, id: res.id } as Product;
          const newProducts = [newProduct, ...products]; // Add to top
          setProducts(newProducts);
          cachedProducts = newProducts;
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    const res = await deleteProduct(productToDelete.id);
    if (res.success) {
      const newProducts = products.filter(p => p.id !== productToDelete.id);
      setProducts(newProducts);
      cachedProducts = newProducts;
      setProductToDelete(null);
    } else {
      alert("Failed to delete product.");
    }
  };

  const handleToggleActive = async (product: Product) => {
    const newStatus = !product.active;
    const res = await updateProduct(product.id, { active: newStatus });
    if (res.success) {
      const newProducts = products.map(p => p.id === product.id ? { ...p, active: newStatus } : p);
      setProducts(newProducts);
      cachedProducts = newProducts;
    } else {
      alert("Failed to change product status.");
    }
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  // Client-side search and filter
  const filteredProducts = useMemo(() => {
    let result = products;

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'ACTIVE') result = result.filter(p => p.active);
      if (statusFilter === 'INACTIVE') result = result.filter(p => !p.active);
      if (statusFilter === 'AVAILABLE') result = result.filter(p => p.available);
      if (statusFilter === 'UNAVAILABLE') result = result.filter(p => !p.available);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query))
      );
    }

    return result;
  }, [products, statusFilter, searchQuery]);

  // Summary Counts
  const counts = useMemo(() => {
    return {
      total: products.length,
      active: products.filter(p => p.active).length,
      inactive: products.filter(p => !p.active).length,
      available: products.filter(p => p.available).length,
      unavailable: products.filter(p => !p.available).length,
    };
  }, [products]);

  return (
    <div className="pb-10">
      <SlideUp className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-sans text-4xl font-bold uppercase tracking-widest mb-2">Products Management</h1>
          <p className="text-black/60 font-bold uppercase tracking-widest text-sm">Add, edit and manage your pickle products.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleRefresh} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-4 text-xs font-bold uppercase tracking-widest border border-black hover:bg-black/5 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={openAddModal} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity">
            <Plus className="w-4 h-4" /> Add Pickle
          </button>
        </div>
      </SlideUp>
      
      {/* SUMMARY STATS */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StaggerItem className="border border-black p-4 bg-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Total Products</div>
          <div className="text-2xl font-sans font-bold">{loading && products.length === 0 ? '-' : counts.total}</div>
        </StaggerItem>
        <StaggerItem className="border border-black p-4 bg-black text-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Active</div>
          <div className="text-2xl font-sans font-bold">{loading && products.length === 0 ? '-' : counts.active}</div>
        </StaggerItem>
        <StaggerItem className="border border-black p-4 bg-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Inactive</div>
          <div className="text-2xl font-sans font-bold">{loading && products.length === 0 ? '-' : counts.inactive}</div>
        </StaggerItem>
        <StaggerItem className="border border-black p-4 bg-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Available</div>
          <div className="text-2xl font-sans font-bold">{loading && products.length === 0 ? '-' : counts.available}</div>
        </StaggerItem>
        <StaggerItem className="border border-black p-4 bg-white text-center">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Unavailable</div>
          <div className="text-2xl font-sans font-bold">{loading && products.length === 0 ? '-' : counts.unavailable}</div>
        </StaggerItem>
      </StaggerContainer>

      {/* FILTERS & SEARCH */}
      <FadeIn delay={0.2} className="flex flex-col xl:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
          <input 
            type="text" 
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pl-12 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black text-sm font-medium"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(status => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); }}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border transition-colors ${
                statusFilter === status 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black/20 hover:border-black'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </FadeIn>

      {error ? (
        <div className="p-6 border border-red-600 bg-red-50 text-red-900 font-bold text-center">
          <p className="mb-4">{error}</p>
          <button onClick={() => fetchProducts(true)} className="px-6 py-2 bg-red-600 text-white text-sm uppercase tracking-widest">Try Again</button>
        </div>
      ) : (
        <ProductsGrid 
          products={filteredProducts} 
          isLoading={loading} 
          onEdit={openEditModal}
          onDelete={setProductToDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* MODALS */}
      {isFormModalOpen && (
        <ProductFormModal 
          initialData={selectedProduct}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}

      {productToDelete && (
        <DeleteConfirmDialog 
          productName={productToDelete.name}
          onCancel={() => setProductToDelete(null)}
          onConfirm={handleDeleteProduct}
        />
      )}
    </div>
  );
}
