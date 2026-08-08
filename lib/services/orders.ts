import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getProductById } from './products';

export type CustomerInfo = {
  name: string;
  whatsapp: string;
  address: string;
  city: string;
  pincode: string;
};

export type CartItemInput = {
  productId: string;
  quantity: number;
  expectedPrice: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  weight: string;
  price: number;
  quantity: number;
};

export type Order = {
  orderId: string;
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: any;
  updatedAt: any;
};

const generateOrderId = () => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PKL-${dateStr}-${randomStr}`;
};

export const createOrder = async (
  customer: CustomerInfo,
  cartItems: CartItemInput[]
): Promise<{ success: boolean; orderId?: string; totalAmount?: number; error?: string }> => {
  try {
    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: 'Cart is empty.' };
    }

    const verifiedItems: OrderItem[] = [];
    let totalAmount = 0;

    // Verify each item against Firestore
    for (const item of cartItems) {
      const product = await getProductById(item.productId);
      
      if (!product) {
        return { success: false, error: `One or more items in your cart are no longer available. Please review your cart.` };
      }
      
      if (!product.active || !product.available) {
        return { success: false, error: `One or more items in your cart are no longer available. Please review your cart.` };
      }

      // Parse the price string (e.g., "₹250") to a number
      const numericPrice = parseInt(product.price.replace(/[^0-9]/g, ''), 10);
      
      if (isNaN(numericPrice)) {
        return { success: false, error: `Invalid price format for "${product.name}".` };
      }

      if (numericPrice !== item.expectedPrice) {
        return { success: false, error: `The price of one or more items has changed. Please review your cart before placing the order.` };
      }

      verifiedItems.push({
        productId: product.id,
        name: product.name,
        weight: product.weight,
        price: numericPrice,
        quantity: item.quantity
      });

      totalAmount += numericPrice * item.quantity;
    }

    const orderId = generateOrderId();
    
    const newOrder = {
      orderId,
      customer: {
        name: customer.name,
        whatsapp: customer.whatsapp,
        address: customer.address,
        city: customer.city,
        pincode: customer.pincode
      },
      items: verifiedItems,
      totalAmount,
      status: 'PENDING',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const ordersRef = collection(db, 'orders');
    await addDoc(ordersRef, newOrder);

    return { success: true, orderId, totalAmount };
  } catch (error: any) {
    console.error('Error creating order:', error);
    return { success: false, error: 'We couldn\'t place your order right now. Please try again.' };
  }
};
