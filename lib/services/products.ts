import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // We need to export db from lib/firebase.ts

export type Product = {
  id: string;
  name: string;
  desc: string;
  weight: string;
  price: string; // "₹250"
  imageBase64: string;
  active: boolean;
  available: boolean;
  description?: string;
  ingredients?: string;
  category?: string;
};

let productsMemoryCache: { data: Product[], timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
const CACHE_KEY = 'pickles_products_cache';

export const clearProductsCache = () => {
  productsMemoryCache = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(CACHE_KEY);
  }
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    // 1. Check Memory Cache
    if (productsMemoryCache && Date.now() - productsMemoryCache.timestamp < CACHE_DURATION) {
      return productsMemoryCache.data;
    }

    // 2. Check Session Storage (browser only)
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            productsMemoryCache = { data, timestamp };
            return data;
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    }

    // 3. Fetch from Firebase
    const productsRef = collection(db, 'products');
    // Only filter by active. Available status is handled on the client.
    const q = query(productsRef, where('active', '==', true));
    const snapshot = await getDocs(q);
    
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    // 4. Save to Cache
    productsMemoryCache = { data, timestamp: Date.now() };
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(productsMemoryCache));
    }

    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

let singleProductMemoryCache: Record<string, { data: Product, timestamp: number }> = {};
const SINGLE_CACHE_KEY = 'pickles_single_product_cache';

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    // 1. Check if it exists in the full catalog cache first (cheapest)
    if (productsMemoryCache && Date.now() - productsMemoryCache.timestamp < CACHE_DURATION) {
      const found = productsMemoryCache.data.find(p => p.id === id);
      if (found) return found;
    }

    // 2. Check local memory cache for this specific product
    if (singleProductMemoryCache[id] && Date.now() - singleProductMemoryCache[id].timestamp < CACHE_DURATION) {
      return singleProductMemoryCache[id].data;
    }

    // 3. Check Session Storage for this specific product
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(SINGLE_CACHE_KEY);
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          if (parsedCache[id] && Date.now() - parsedCache[id].timestamp < CACHE_DURATION) {
            singleProductMemoryCache = parsedCache;
            return parsedCache[id].data;
          }
        } catch (e) {
          // ignore
        }
      }
    }

    // 4. Fetch from Firebase
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const product = {
        id: docSnap.id,
        ...docSnap.data()
      } as Product;

      // 5. Save to single product cache
      singleProductMemoryCache[id] = { data: product, timestamp: Date.now() };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SINGLE_CACHE_KEY, JSON.stringify(singleProductMemoryCache));
      }

      return product;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

// ADMIN FUNCTIONS

export const getAdminProducts = async (): Promise<Product[]> => {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const productsRef = collection(db, 'products');
    
    // Fetch all products without active/available filters
    const snapshot = await getDocs(productsRef);
    
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    // Sort by createdAt desc in memory to avoid needing an index immediately
    return products.sort((a: any, b: any) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return [];
  }
};

export const createProduct = async (productData: Omit<Product, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const { addDoc, serverTimestamp } = await import('firebase/firestore');
    const productsRef = collection(db, 'products');
    
    const docRef = await addDoc(productsRef, {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    clearProductsCache(); // Invalidate cache
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: 'Failed to create product' };
  }
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { updateDoc, serverTimestamp } = await import('firebase/firestore');
    const docRef = doc(db, 'products', id);
    
    // Remove id from productData if it exists so we don't save it into the document fields
    const { id: _, ...dataToUpdate } = productData as any;
    
    await updateDoc(docRef, {
      ...dataToUpdate,
      updatedAt: serverTimestamp()
    });

    clearProductsCache(); // Invalidate cache
    return { success: true };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: 'Failed to update product' };
  }
};

export const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
    
    clearProductsCache(); // Invalidate cache
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
};
