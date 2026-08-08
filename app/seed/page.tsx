'use client';

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const sampleProducts = [
  {
    name: 'Mango Pickle',
    desc: 'Traditional recipe',
    description: 'Authentic homemade mango pickle crafted with raw mangoes, traditional spices, and cold-pressed sesame oil. Aged to perfection in ceramic jars just like grandmother used to make.',
    weight: '500g',
    price: '₹250',
    imageBase64: '', // Empty for now, will use placeholder UI
    active: true,
    available: true,
    ingredients: 'Raw Mango, Mustard Powder, Red Chili Powder, Salt, Fenugreek, Garlic, Cold-Pressed Sesame Oil.',
    category: 'Mango'
  },
  {
    name: 'Garlic Pickle',
    desc: 'Bold & spicy',
    description: 'A fiery, pungent, and deeply flavorful pickle made with whole garlic cloves. Perfect for adding a bold kick to any mild dish.',
    weight: '500g',
    price: '₹280',
    imageBase64: '',
    active: true,
    available: true,
    ingredients: 'Garlic Cloves, Red Chili Powder, Salt, Turmeric, Cumin, Mustard Oil, Vinegar.',
    category: 'Garlic'
  },
  {
    name: 'Mixed Veg Pickle',
    desc: 'Farm fresh',
    description: 'A crunchy, tangy, and mildly spiced blend of fresh seasonal vegetables. A versatile companion for rice, rotis, and parathas.',
    weight: '500g',
    price: '₹240',
    imageBase64: '',
    active: true,
    available: true,
    ingredients: 'Carrot, Cauliflower, Green Chili, Lemon, Mustard Seeds, Fennel, Spices, Oil.',
    category: 'Mixed'
  },
  {
    name: 'Chili Pickle',
    desc: 'Extra hot',
    description: 'Not for the faint-hearted. Hand-picked green chilies marinated in a sharp mustard and lemon base. Instant heat for your meals.',
    weight: '500g',
    price: '₹220',
    imageBase64: '',
    active: true,
    available: true,
    ingredients: 'Green Chilies, Lemon Juice, Mustard Oil, Salt, Fenugreek Seeds, Turmeric.',
    category: 'Chili'
  }
];

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const seedDatabase = async () => {
    setLoading(true);
    setStatus('Seeding...');
    try {
      const productsRef = collection(db, 'products');
      
      for (const product of sampleProducts) {
        await addDoc(productsRef, product);
      }
      
      setStatus('Successfully seeded database! You can now visit /pickles to see them.');
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-6">
      <h1 className="font-sans text-4xl mb-6">Database Seeder</h1>
      <p className="mb-8 text-center max-w-md">Click the button below to add sample products to your Firebase Firestore database.</p>
      
      <button 
        onClick={seedDatabase}
        disabled={loading}
        className="px-8 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors rounded-full"
      >
        {loading ? 'Seeding...' : 'Seed Database'}
      </button>
      
      {status && (
        <div className="mt-8 p-4 border border-black font-medium">
          {status}
        </div>
      )}
    </div>
  );
}
