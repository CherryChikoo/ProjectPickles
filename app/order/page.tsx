'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/CartContext';
import { createOrder, CustomerInfo } from '@/lib/services/orders';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export default function OrderPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  
  const [formData, setFormData] = useState<CustomerInfo>({
    name: '',
    whatsapp: '',
    address: '',
    city: '',
    pincode: ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-sans text-4xl md:text-5xl mb-6">Your cart is empty.</h1>
        <p className="font-medium mb-12">You need to add items to your cart before placing an order.</p>
        <Link 
          href="/pickles"
          className="px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors duration-200 rounded-full"
        >
          RETURN TO SHOP
        </Link>
      </div>
    );
  }

  const validate = () => {
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required.';
    
    // WhatsApp Validation
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp number is required.';
    } else {
      let cleanWhatsapp = formData.whatsapp.replace(/[\s\+\-\(\)]/g, '');
      if (cleanWhatsapp.startsWith('91') && cleanWhatsapp.length === 12) {
        cleanWhatsapp = cleanWhatsapp.slice(2);
      }
      
      const whatsappRegex = /^[0-9]{10}$/;
      if (!whatsappRegex.test(cleanWhatsapp)) {
        newErrors.whatsapp = 'Please enter a valid 10-digit WhatsApp number.';
      }
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required.';
    if (!formData.city.trim()) newErrors.city = 'City is required.';
    
    const pinRegex = /^[0-9]{6}$/;
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required.';
    } else if (!pinRegex.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof CustomerInfo]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (validate()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submitOrder = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    const cartItemsPayload = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      expectedPrice: parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0
    }));
    
    const result = await createOrder(formData, cartItemsPayload);
    
    if (result.success && result.orderId) {
      setIsSuccess(true);
      clearCart();
      router.push(`/order/success?id=${result.orderId}&total=${result.totalAmount}`);
    } else {
      setSubmitError(result.error || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
      setStep(1); // Go back to step 1 on error
    }
  };

  return (
    <div className="min-h-screen bg-white text-black px-6 sm:px-10 md:px-14 pt-32 sm:pt-40 md:pt-48 pb-16 md:pb-24 max-w-[1600px] mx-auto">
      {step === 1 ? (
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:pr-2 transition-all mb-16">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
      ) : (
        <button onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:pr-2 transition-all mb-16">
          <ArrowLeft className="w-4 h-4" /> Back to Edit
        </button>
      )}
      
      <div className="mb-12">
        <h1 className="font-sans text-5xl md:text-6xl mb-4">
          {step === 1 ? 'Complete Your Order' : 'Review Your Order'}
        </h1>
        <p className="text-lg font-medium">
          {step === 1 ? 'Enter your details so we can review and confirm your order.' : 'Please verify your contact details before submitting.'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-24">
        
        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-2">
          {submitError && (
            <div className="mb-8 p-6 border-2 border-black bg-white text-black font-bold flex items-center justify-between">
              <span>{submitError}</span>
            </div>
          )}
          
          {step === 1 ? (
            <form onSubmit={handleReview} className="flex flex-col gap-12">
              {/* Customer Info */}
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-8 pb-4 border-b border-black">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold uppercase tracking-wider mb-2">Full Name *</label>
                    <input 
                      type="text" name="name" value={formData.name} onChange={handleChange}
                      className="w-full p-4 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    {errors.name && <p className="mt-2 text-sm font-bold uppercase tracking-wider">{errors.name}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold uppercase tracking-wider mb-2">WhatsApp Number * <span className="font-medium normal-case tracking-normal opacity-80">(Order details will be sent here)</span></label>
                    <input 
                      type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} maxLength={10}
                      className="w-full p-4 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    {errors.whatsapp && <p className="mt-2 text-sm font-bold uppercase tracking-wider">{errors.whatsapp}</p>}
                  </div>
                </div>
              </section>
              
              {/* Delivery Info */}
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-8 pb-4 border-b border-black">Delivery Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold uppercase tracking-wider mb-2">Delivery Address *</label>
                    <textarea 
                      name="address" value={formData.address} onChange={handleChange} rows={3}
                      className="w-full p-4 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black resize-none"
                    />
                    {errors.address && <p className="mt-2 text-sm font-bold uppercase tracking-wider">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wider mb-2">City *</label>
                    <input 
                      type="text" name="city" value={formData.city} onChange={handleChange}
                      className="w-full p-4 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    {errors.city && <p className="mt-2 text-sm font-bold uppercase tracking-wider">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wider mb-2">Pincode *</label>
                    <input 
                      type="text" name="pincode" value={formData.pincode} onChange={handleChange} maxLength={6}
                      className="w-full p-4 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    {errors.pincode && <p className="mt-2 text-sm font-bold uppercase tracking-wider">{errors.pincode}</p>}
                  </div>
                </div>
              </section>
              
              <button 
                type="submit" 
                className="mt-8 w-full py-5 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors duration-200 flex justify-center items-center gap-3"
              >
                REVIEW ORDER
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-12">
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-8 pb-4 border-b border-black">Your Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12 border border-black p-8 text-lg">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-widest text-black/60 mb-1">Full Name</div>
                    <div className="font-bold">{formData.name}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold uppercase tracking-widest text-black/60 mb-1">WhatsApp</div>
                    <div className="font-bold">{formData.whatsapp}</div>
                  </div>
                  <div className="sm:col-span-2 border-t border-black/10 pt-8 mt-4">
                    <div className="text-sm font-bold uppercase tracking-widest text-black/60 mb-1">Delivery Address</div>
                    <div className="font-bold">{formData.address}</div>
                    <div className="font-bold mt-1">{formData.city} - {formData.pincode}</div>
                  </div>
                </div>
              </section>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button 
                  onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={isSubmitting}
                  className="flex-1 py-5 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white border border-black transition-colors duration-200 flex justify-center items-center disabled:opacity-50"
                >
                  GO BACK TO EDIT
                </button>
                <button 
                  onClick={submitOrder}
                  disabled={isSubmitting}
                  className="flex-1 py-5 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors duration-200 flex justify-center items-center gap-3 disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-white"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> PLACING ORDER...</>
                  ) : (
                    'CONFIRM & PLACE ORDER'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* SUMMARY */}
        <div className="lg:col-span-1">
          <div className="border border-black p-8 sticky top-32">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-8 pb-4 border-b border-black">YOUR ORDER</h2>
            
            <div className="flex flex-col gap-6 mb-8">
              {items.map(item => (
                <div key={item.productId} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-sans text-xl mb-1">{item.name}</h3>
                    <p className="text-sm font-medium">{item.weight} &times; {item.quantity}</p>
                  </div>
                  <div className="font-bold">
                    ₹{formatPrice(parseFloat(String(item.price).replace(/[^0-9.]/g, '')) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-black pt-6 flex justify-between items-center font-bold text-2xl">
              <span>Total</span>
              <span>₹{formatPrice(cartTotal)}</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
