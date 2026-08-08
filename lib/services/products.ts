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

export const getProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('active', '==', true), where('available', '==', true));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Product;
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
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
};
