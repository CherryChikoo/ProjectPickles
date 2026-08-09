'use client';

import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSettings, SocialLink } from '@/components/settings/SettingsContext';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { Loader2, Save, Monitor, Smartphone, Trash2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { SlideUp } from '@/components/ui/motion/SlideUp';

export default function AdminSettingsPage() {
  const { settings, isLoading: isContextLoading } = useSettings();
  const { user } = useAdminAuth();
  
  const [storeName, setStoreName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  
  const [socials, setSocials] = useState<Record<string, SocialLink>>({
    instagram: { enabled: false, name: '', url: '' },
    facebook: { enabled: false, name: '', url: '' },
    whatsapp: { enabled: false, name: '', url: '' },
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Initialize form when settings load
  useEffect(() => {
    if (!isContextLoading) {
      setStoreName(settings.storeName || '');
      setLogoUrl(settings.logoUrl || '');
      setWhatsappNumber(settings.businessWhatsAppNumber || '');
      if (settings.socials) {
        setSocials(settings.socials);
      }
    }
  }, [settings, isContextLoading]);

  const normalizePhoneNumber = (num: string) => {
    if (!num.trim()) return '';
    let clean = num.replace(/[\s\+\-\(\)]/g, '');
    
    if (!/^\d+$/.test(clean)) return null;

    if (clean.length === 10) {
      return '91' + clean;
    } else if (clean.length === 12 && clean.startsWith('91')) {
      return clean;
    }
    
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    let normalizedWhatsapp: string | null = '';
    
    if (whatsappNumber.trim()) {
      normalizedWhatsapp = normalizePhoneNumber(whatsappNumber);
      if (normalizedWhatsapp === null) {
        setMessage({ type: 'error', text: 'Please enter a valid 10-digit WhatsApp number.' });
        setIsSaving(false);
        return;
      }
    }

    try {
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, {
        storeName: storeName.trim(),
        logoUrl: logoUrl.trim() || null,
        businessWhatsAppNumber: normalizedWhatsapp || null,
        socials: socials,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setWhatsappNumber(normalizedWhatsapp); // Update input to normalized version
      setMessage({ type: 'success', text: 'Settings saved successfully! The website has been updated.' });
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: 'error', text: 'Failed to save settings. Make sure you have admin permissions.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isContextLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div>
      <SlideUp className="mb-10">
        <h1 className="font-sans text-4xl font-bold uppercase tracking-widest mb-2">Global Settings</h1>
        <p className="text-black/60 font-bold uppercase tracking-widest text-sm">Configure your website branding.</p>
      </SlideUp>
      
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
            className="overflow-hidden"
          >
            <div className={`p-4 border-2 ${message.type === 'success' ? 'border-black bg-black text-white' : 'border-black bg-white text-black'} font-bold uppercase tracking-wider text-sm`}>
              {message.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FadeIn delay={0.2} className="bg-white border border-black p-6 md:p-10 max-w-2xl">
        <form onSubmit={handleSave} className="flex flex-col gap-8">
          
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">Store Name</label>
            <p className="text-xs font-bold uppercase tracking-widest text-black/60 mb-3">This appears in the navbar and footer.</p>
            <input 
              type="text" 
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full p-4 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. Hema Sathya Foods"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider mb-2">Logo Image URL</label>
            <p className="text-xs font-bold uppercase tracking-widest text-black/60 mb-3">Paste a direct link to an image (e.g., https://example.com/logo.png). Leave blank to use the default SVG icon.</p>
            <input 
              type="url" 
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full p-4 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="https://..."
            />
            
            {/* Logo Preview */}
            {logoUrl && (
              <div className="mt-4 p-4 border border-black/20 bg-black/5 flex flex-col items-center justify-center">
                <span className="text-xs font-bold uppercase tracking-widest text-black/60 mb-2">Preview</span>
                <img 
                  src={logoUrl} 
                  alt="Logo Preview" 
                  className="max-h-16 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) (fallback as HTMLElement).style.display = 'block';
                  }}
                />
                <div className="hidden text-xs font-bold uppercase tracking-widest text-red-600 mt-2">
                  Image failed to load. Check the URL.
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Settings Section */}
          <div className="pt-8 border-t border-black">
            <h2 className="font-sans text-2xl font-bold uppercase tracking-widest mb-6">WhatsApp Settings</h2>
            
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">Business WhatsApp Number</label>
              <p className="text-xs font-bold uppercase tracking-widest text-black/60 mb-3">This is the WhatsApp number used by your business/admin account to communicate with customers.</p>
              <input 
                type="text" 
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full p-4 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="+91 98765 43210"
              />
              {whatsappNumber && (
                <div className="mt-2 text-xs font-bold uppercase tracking-widest text-black/60 flex items-center gap-1">
                  ✓ Current value: {whatsappNumber}
                </div>
              )}
            </div>
          </div>

          {/* Social Links Section */}
          <div className="pt-8 border-t border-black">
            <h2 className="font-sans text-2xl font-bold uppercase tracking-widest mb-6">Social Links</h2>
            <p className="text-sm font-bold uppercase tracking-widest text-black/60 mb-6">These links will appear on the landing page.</p>
            
            {(['instagram', 'facebook', 'whatsapp'] as const).map((platform) => (
              <div key={platform} className="mb-6 p-6 border border-black bg-black/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold uppercase tracking-widest text-lg">{platform}</h3>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={socials[platform].enabled}
                        onChange={(e) => setSocials(prev => ({
                          ...prev,
                          [platform]: { ...prev[platform], enabled: e.target.checked }
                        }))}
                      />
                      <div className={`block w-14 h-8 rounded-full border-2 border-black transition-colors ${socials[platform].enabled ? 'bg-black' : 'bg-white'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white border-2 border-black w-6 h-6 rounded-full transition-transform ${socials[platform].enabled ? 'transform translate-x-6 border-white' : ''}`}></div>
                    </div>
                  </label>
                </div>
                
                {socials[platform].enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2">Display Name</label>
                      <input 
                        type="text" 
                        value={socials[platform].name}
                        onChange={(e) => setSocials(prev => ({
                          ...prev,
                          [platform]: { ...prev[platform], name: e.target.value }
                        }))}
                        className="w-full p-3 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                        placeholder={`e.g. @our_${platform}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider mb-2">Link URL</label>
                      <input 
                        type="url" 
                        value={socials[platform].url}
                        onChange={(e) => setSocials(prev => ({
                          ...prev,
                          [platform]: { ...prev[platform], url: e.target.value }
                        }))}
                        className="w-full p-3 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <motion.button 
            whileTap={isSaving || storeName.trim() === '' ? undefined : { scale: 0.97 }}
            type="submit" 
            disabled={isSaving || storeName.trim() === ''}
            className="mt-4 w-full py-5 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors duration-200 flex justify-center items-center gap-3 disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-white"
          >
            {isSaving ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> SAVING...</>
            ) : (
              <><Save className="w-5 h-5" /> SAVE SETTINGS</>
            )}
          </motion.button>
        </form>
      </FadeIn>

    </div>
  );
}

