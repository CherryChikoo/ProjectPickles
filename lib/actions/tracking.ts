'use server';

import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { OrderItem } from '@/lib/services/orders';

export type TrackedOrder = {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
};

export async function getTrackedOrder(orderId: string): Promise<{ success: boolean; order?: TrackedOrder; error?: string }> {
  try {
    if (!orderId || typeof orderId !== 'string') {
      return { success: false, error: 'Invalid Order ID' };
    }

    const trimmedId = orderId.trim();

    // Query Firestore collection using the exact list constraints defined in firestore.rules
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('orderId', '==', trimmedId), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: 'Order not found' };
    }

    const orderData = snapshot.docs[0].data();

    // Safely extract timestamps (fallback to current date if missing so it doesn't break)
    const createdAtDate = orderData.createdAt?.toDate ? orderData.createdAt.toDate() : new Date();
    const updatedAtDate = orderData.updatedAt?.toDate ? orderData.updatedAt.toDate() : new Date();

    // Construct the sanitized order object without exposing address, full phone number, or internal IDs
    const sanitizedOrder: TrackedOrder = {
      orderId: orderData.orderId,
      customerName: orderData.customer?.name || 'Customer', // Only expose the name
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      status: orderData.status || 'PENDING',
      createdAt: createdAtDate.toISOString(),
      updatedAt: updatedAtDate.toISOString(),
      rejectionReason: orderData.rejectionReason,
    };

    return { success: true, order: sanitizedOrder };
  } catch (error) {
    console.error('Error fetching tracked order:', error);
    // Do not expose raw Firestore errors to the client
    return { success: false, error: 'Unable to track order. Please try again.' };
  }
}
