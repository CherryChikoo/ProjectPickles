'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider 
} from 'firebase/auth';
import { Loader2, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AccountSettings() {
  const { user } = useAdminAuth();
  
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.email) {
      setMessage({ type: 'error', text: 'You must be logged in to change credentials.' });
      return;
    }

    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required to make changes.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // 1. Re-authenticate to ensure "recent login" requirement is met
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      let emailUpdated = false;
      let passwordUpdated = false;

      // 2. Update Email if changed
      if (email.trim() && email.trim() !== user.email) {
        await updateEmail(user, email.trim());
        emailUpdated = true;
      }

      // 3. Update Password if provided
      if (newPassword.trim()) {
        if (newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await updatePassword(user, newPassword.trim());
        passwordUpdated = true;
      }

      // Success messages
      if (emailUpdated && passwordUpdated) {
        setMessage({ type: 'success', text: 'Email and password updated successfully!' });
      } else if (emailUpdated) {
        setMessage({ type: 'success', text: 'Email updated successfully!' });
      } else if (passwordUpdated) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
      } else {
        setMessage({ type: 'success', text: 'No changes were made.' });
      }

      // Clear sensitive fields
      setNewPassword('');
      setCurrentPassword('');

    } catch (error: any) {
      console.error("Error updating credentials:", error);
      
      // Handle common Firebase Auth errors gracefully
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setMessage({ type: 'error', text: 'Incorrect current password. Please try again.' });
      } else if (error.code === 'auth/invalid-email') {
        setMessage({ type: 'error', text: 'The new email address is not valid.' });
      } else if (error.code === 'auth/email-already-in-use') {
        setMessage({ type: 'error', text: 'This email is already registered to another account.' });
      } else {
        setMessage({ type: 'error', text: error.message || 'An error occurred while updating credentials.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-black p-6 md:p-10 w-full h-fit sticky top-10">
      <div className="mb-8">
        <h2 className="font-sans text-2xl font-bold uppercase tracking-widest mb-2 flex items-center gap-3">
          <KeyRound className="w-6 h-6" /> Account Security
        </h2>
        <p className="text-xs font-bold uppercase tracking-widest text-black/60">
          Change your admin email or password. You must provide your current password to save changes.
        </p>
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

      <form onSubmit={handleUpdateCredentials} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider mb-2">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="admin@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wider mb-2">New Password</label>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/60 mb-2">Leave blank to keep current password.</p>
          <input 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-4 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </div>

        <div className="pt-6 border-t border-black/10 mt-2">
          <label className="block text-sm font-bold uppercase tracking-wider mb-2 text-red-600">Current Password (Required)</label>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/60 mb-2">Required to verify your identity before making changes.</p>
          <input 
            type="password" 
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-4 border border-red-600/50 focus:border-red-600 bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <motion.button 
          whileTap={isSaving ? undefined : { scale: 0.97 }}
          type="submit" 
          disabled={isSaving || !currentPassword}
          className="mt-4 w-full py-5 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors duration-200 flex justify-center items-center gap-3 disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-white"
        >
          {isSaving ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> VERIFYING...</>
          ) : (
            'UPDATE CREDENTIALS'
          )}
        </motion.button>
      </form>
    </div>
  );
}
