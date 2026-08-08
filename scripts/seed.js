import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8WXz63Bsf1VV1sy7sY7Rx40zMd4z0TBU",
  authDomain: "lmsv2-6440d.firebaseapp.com",
  projectId: "lmsv2-6440d",
  storageBucket: "lmsv2-6440d.firebasestorage.app",
  messagingSenderId: "1044631403962",
  appId: "1:1044631403962:web:d1e0c9fb624a5b6e1c3183",
  measurementId: "G-RS4VXBLQP1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleProducts = [
  {
    name: 'Mango Pickle',
    desc: 'Traditional recipe',
    description: 'Authentic homemade mango pickle crafted with raw mangoes, traditional spices, and cold-pressed sesame oil. Aged to perfection in ceramic jars just like grandmother used to make.',
    weight: '500g',
    price: '₹250',
    imageBase64: '',
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
  },
  // Adding duplicates as requested to make a bigger grid
  {
    name: 'Gongura Pickle',
    desc: 'Andhra Special',
    description: 'A deeply tangy and spicy pickle made with authentic Gongura (Sorrel) leaves.',
    weight: '250g',
    price: '₹180',
    imageBase64: '',
    active: true,
    available: true,
    ingredients: 'Gongura leaves, Red chilies, Garlic, Mustard seeds, Oil.',
    category: 'Gongura'
  },
  {
    name: 'Lemon Pickle',
    desc: 'Sweet & Tangy',
    description: 'A mature, sun-dried lemon pickle that is both tangy and slightly sweet. Great for digestion.',
    weight: '500g',
    price: '₹210',
    imageBase64: '',
    active: true,
    available: true,
    ingredients: 'Lemons, Salt, Sugar, Red Chili Powder, Roasted Cumin.',
    category: 'Lemon'
  }
];

async function seed() {
  console.log('Seeding Firestore...');
  const productsRef = collection(db, 'products');
  
  for (const product of sampleProducts) {
    await addDoc(productsRef, product);
    console.log(`Added ${product.name}`);
  }
  
  console.log('Successfully seeded database!');
  process.exit(0);
}

seed().catch(console.error);
