'use client';

import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSettings } from '@/components/settings/SettingsContext';
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
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Initialize form when settings load
  useEffect(() => {
    if (!isContextLoading) {
      setStoreName(settings.storeName || '');
      setLogoUrl(settings.logoUrl || '');
      setWhatsappNumber(settings.businessWhatsAppNumber || '');
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

      <FadeIn delay={0.3} className="mt-12 max-w-2xl">
        {user && <ActiveSessionsManager userUid={user.uid} />}
      </FadeIn>
    </div>
  );
}

function ActiveSessionsManager({ userUid }: { userUid: string }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const localSessionId = typeof window !== 'undefined' ? localStorage.getItem('adminSessionId') : null;

  useEffect(() => {
    let unsubscribe: () => void;
    
    const fetchSessions = async () => {
      try {
        const { collection, query, where, onSnapshot } = await import('firebase/firestore');
        const q = query(
          collection(db, 'adminSessions'), 
          where('adminUid', '==', userUid),
          where('revoked', '==', false)
        );
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Filter locally just in case index is missing
          setSessions(fetched.filter(s => !s.revoked));
          setLoading(false);
        });
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setLoading(false);
      }
    };
    
    fetchSessions();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userUid]);

  const revokeSession = async (sessionIdToRevoke: string) => {
    if (!confirm('Revoke this admin session?')) return;
    
    setActionLoadingId(sessionIdToRevoke);
    try {
      const { runTransaction, serverTimestamp } = await import('firebase/firestore');
      const trackerRef = doc(db, 'users', userUid, 'sessionTracker', 'data');
      const sessionRef = doc(db, 'adminSessions', sessionIdToRevoke);
      
      await runTransaction(db, async (transaction) => {
        const trackerDoc = await transaction.get(trackerRef);
        if (trackerDoc.exists()) {
          const activeSessionIds = trackerDoc.data().activeSessionIds || [];
          const newActiveSessionIds = activeSessionIds.filter((id: string) => id !== sessionIdToRevoke);
          transaction.set(trackerRef, { activeSessionIds: newActiveSessionIds }, { merge: true });
        }
        transaction.set(sessionRef, { 
          revoked: true, 
          revokedAt: serverTimestamp() 
        }, { merge: true });
      });
    } catch (err) {
      console.error(err);
      alert('Failed to revoke session.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const revokeAllOthers = async () => {
    if (!localSessionId) return;
    if (!confirm('Are you sure you want to sign out all other devices?')) return;
    
    setActionLoadingId('all-others');
    try {
      const { runTransaction, serverTimestamp } = await import('firebase/firestore');
      const trackerRef = doc(db, 'users', userUid, 'sessionTracker', 'data');
      
      await runTransaction(db, async (transaction) => {
        const trackerDoc = await transaction.get(trackerRef);
        
        const otherSessions = sessions.filter(s => s.id !== localSessionId);
        
        if (trackerDoc.exists()) {
          // Keep only current session
          transaction.set(trackerRef, { activeSessionIds: [localSessionId] }, { merge: true });
        }
        
        // Revoke all other session docs
        for (const s of otherSessions) {
          const sRef = doc(db, 'adminSessions', s.id);
          transaction.set(sRef, { 
            revoked: true, 
            revokedAt: serverTimestamp() 
          }, { merge: true });
        }
      });
    } catch (err) {
      console.error(err);
      alert('Failed to revoke other sessions.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-black p-6 md:p-10 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const activeCount = sessions.length;

  return (
    <div className="bg-white border border-black p-6 md:p-10">
      <div className="flex justify-between items-end mb-6 pb-6 border-b border-black">
        <div>
          <h2 className="font-sans text-2xl font-bold uppercase tracking-widest mb-2">Active Admin Sessions</h2>
          <p className="text-black/60 font-bold uppercase tracking-widest text-xs">Maximum 3 active sessions allowed.</p>
        </div>
        <div className="text-right">
          <span className="font-sans text-3xl font-bold">{activeCount} / 3</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {sessions.map(s => {
          const isCurrent = s.id === localSessionId;
          const isMobile = s.deviceLabel?.toLowerCase().includes('mobile');
          const Icon = isMobile ? Smartphone : Monitor;
          
          let lastActiveText = 'Unknown';
          if (s.lastActiveAt) {
            const diffMs = Date.now() - s.lastActiveAt.toMillis();
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 2) lastActiveText = 'Just now';
            else if (diffMins < 60) lastActiveText = `${diffMins} mins ago`;
            else if (diffMins < 1440) lastActiveText = `${Math.floor(diffMins/60)} hours ago`;
            else lastActiveText = `${Math.floor(diffMins/1440)} days ago`;
          }
          
          return (
            <div key={s.id} className={`p-4 border ${isCurrent ? 'border-black bg-black/5' : 'border-black/20'} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white border border-black shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                    {s.deviceLabel || 'Unknown Device'}
                    {isCurrent && <span className="bg-black text-white text-[10px] px-2 py-0.5">CURRENT</span>}
                  </div>
                  <div className="text-xs text-black/60 font-bold uppercase tracking-widest mt-1">
                    Last active: {lastActiveText}
                  </div>
                </div>
              </div>
              
              {!isCurrent && (
                <button
                  onClick={() => revokeSession(s.id)}
                  disabled={actionLoadingId !== null}
                  className="px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 shrink-0"
                >
                  {actionLoadingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Revoke
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      {sessions.length > 1 && (
        <div className="mt-8 pt-6 border-t border-black">
          <button
            onClick={revokeAllOthers}
            disabled={actionLoadingId !== null}
            className="w-full py-4 border border-black text-black hover:bg-black hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {actionLoadingId === 'all-others' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Sign Out All Other Devices
          </button>
        </div>
      )}
    </div>
  );
}
