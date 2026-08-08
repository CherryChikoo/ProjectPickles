'use client';

import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSettings } from '@/components/settings/SettingsContext';
import { Loader2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminSettingsPage() {
  const { settings, isLoading: isContextLoading } = useSettings();
  
  const [storeName, setStoreName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Initialize form when settings load
  useEffect(() => {
    if (!isContextLoading) {
      setStoreName(settings.storeName || '');
      setLogoUrl(settings.logoUrl || '');
    }
  }, [settings, isContextLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, {
        storeName: storeName.trim(),
        logoUrl: logoUrl.trim() || null,
        updatedAt: new Date().toISOString()
      }, { merge: true });

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
      <div className="mb-10">
        <h1 className="font-sans text-4xl font-bold uppercase tracking-widest mb-2">Global Settings</h1>
        <p className="text-black/60 font-bold uppercase tracking-widest text-sm">Configure your website branding.</p>
      </div>
      
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

      <div className="bg-white border border-black p-6 md:p-10 max-w-2xl">
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
      </div>
    </div>
  );
}
