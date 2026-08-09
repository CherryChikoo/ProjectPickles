'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, isLoading } = useAdminAuth();

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      const returnUrl = searchParams.get('returnUrl');
      router.push(returnUrl || '/admin');
    }
  }, [user, isAdmin, isLoading, router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // 2. Generate unique session ID for this browser
      const sessionId = crypto.randomUUID();
      
      // 3. Secure Server-Side/Transactional Enforcement
      const trackerRef = doc(db, 'users', uid, 'sessionTracker', 'data');
      const newSessionRef = doc(db, 'adminSessions', sessionId);

      await runTransaction(db, async (transaction) => {
        const trackerDoc = await transaction.get(trackerRef);
        
        let activeSessionIds: string[] = [];
        
        if (trackerDoc.exists()) {
          activeSessionIds = trackerDoc.data().activeSessionIds || [];
        }
        
        // Let's filter out expired ones if needed, but for now we trust activeSessionIds 
        // as they are cleaned up on logout/revoke.
        
        if (activeSessionIds.length >= 3) {
          throw new Error('MAX_SESSIONS_REACHED');
        }
        
        // Append new session
        const newActiveSessionIds = [...activeSessionIds, sessionId];
        
        // Update tracker
        transaction.set(trackerRef, {
          activeSessionIds: newActiveSessionIds,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        // Create session document
        transaction.set(newSessionRef, {
          sessionId,
          adminUid: uid,
          createdAt: serverTimestamp(),
          lastActiveAt: serverTimestamp(),
          userAgent: navigator.userAgent,
          deviceLabel: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser',
          revoked: false
        });
      });

      // 4. Save session ID locally
      localStorage.setItem('adminSessionId', sessionId);

      // AdminAuthContext will automatically detect the login, verify the role and session in Firestore,
      // update the state, and the useEffect above will redirect them to the dashboard.
    } catch (err: any) {
      console.error('Login error:', err);
      // If we aborted the transaction, sign out from firebase immediately
      if (err.message === 'MAX_SESSIONS_REACHED') {
        await firebaseSignOut(auth);
        setError('Maximum 3 active admin sessions reached. Sign out another device before logging in here.');
        setIsSubmitting(false);
        return;
      }
      // Map Firebase errors to user-friendly messages
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact the system administrator.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred during login. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  // If still checking initial auth state, show loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-black animate-spin" />
      </div>
    );
  }

  // If already logged in (redirecting), return null to prevent flashing the login form
  if (user && isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:pr-2 transition-all">
          <ArrowLeft className="w-4 h-4" /> Return to Website
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h1 className="font-sans text-4xl font-bold uppercase tracking-widest mb-4">Admin Portal</h1>
            <p className="text-sm font-bold uppercase tracking-widest text-black/60">Restricted Access Only</p>
          </div>

          {error && (
            <div className="mb-8 p-4 border-2 border-black bg-white text-black font-bold text-center text-sm uppercase tracking-wider">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-8">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">Admin Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full p-4 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full p-4 border border-black bg-white focus:outline-none focus:ring-1 focus:ring-black pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/60 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="mt-4 w-full py-5 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black border border-black transition-colors duration-200 flex justify-center items-center gap-3 disabled:opacity-50 disabled:hover:bg-black disabled:hover:text-white"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> AUTHENTICATING...</>
              ) : (
                'SECURE SIGN IN'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-black animate-spin" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
