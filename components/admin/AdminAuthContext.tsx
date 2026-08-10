'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, onSnapshot, runTransaction, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
  signOut: async () => {},
});

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let unsubscribeUser: () => void;
    let unsubscribeSession: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // 1. Verify User is Admin
        const userDocRef = doc(db, 'users', currentUser.uid);
        unsubscribeUser = onSnapshot(userDocRef, async (userDocSnap) => {
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // Allow missing 'active' field to default to true for backwards compatibility with seeded admins
            if (userData.role === 'admin' && userData.active !== false) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
              await signOut();
            }
          } else {
            setIsAdmin(false);
            await signOut();
          }
        }, async (error) => {
          console.error("Error fetching user role:", error);
          setIsAdmin(false);
          await signOut();
        });

        // 2. Validate specific Session (Heartbeat & Revocation)
        const localSessionId = localStorage.getItem('adminSessionId');
        if (localSessionId) {
          const sessionRef = doc(db, 'adminSessions', localSessionId);
          unsubscribeSession = onSnapshot(sessionRef, async (sessionSnap) => {
            if (sessionSnap.exists()) {
              const sessionData = sessionSnap.data();
              if (sessionData.revoked) {
                // This specific session was revoked
                toast.error("Your session has been revoked from another device.");
                setIsAdmin(false);
                await signOut(false); // don't try to revoke it again
              } else {
                // IMPORTANT: When updateDoc is called with serverTimestamp(), the local snapshot fires
                // immediately with lastActiveAt set to null until the server responds. 
                // We default to Date.now() if it's null to avoid immediately expiring the session.
                const lastActive = sessionData.lastActiveAt ? sessionData.lastActiveAt.toMillis() : Date.now();
                if (Date.now() - lastActive > 60 * 60 * 1000) {
                  toast.error("Your session has expired due to inactivity.");
                  setIsAdmin(false);
                  await signOut(false);
                }
              }
            } else {
              // Session record doesn't exist, invalid session
              setIsAdmin(false);
              await signOut(false);
            }
            setIsLoading(false);
          }, async (error) => {
            console.error("Error fetching session:", error);
            setIsLoading(false);
          });
        } else {
          // No session id found
          setIsLoading(false);
          if (pathname !== '/admin/login') {
             signOut(false);
          }
        }

      } else {
        setIsAdmin(false);
        setIsLoading(false);
        if (unsubscribeUser) unsubscribeUser();
        if (unsubscribeSession) unsubscribeSession();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeSession) unsubscribeSession();
    };
  }, [pathname]);

  useEffect(() => {
    if (!isAdmin || !user) return;

    let lastInteraction = Date.now();
    const updateInteraction = () => {
      lastInteraction = Date.now();
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(e => window.addEventListener(e, updateInteraction));

    const interval = setInterval(() => {
      const now = Date.now();
      const localSessionId = localStorage.getItem('adminSessionId');
      
      if (now - lastInteraction > 60 * 60 * 1000) {
        toast.error("Your session has expired due to inactivity.");
        signOut(true);
      } else if (localSessionId && (now - lastInteraction < 16 * 60 * 1000)) {
        // Heartbeat if active recently
        const sessionRef = doc(db, 'adminSessions', localSessionId);
        updateDoc(sessionRef, { lastActiveAt: serverTimestamp() }).catch(() => {});
      }
    }, 15 * 60 * 1000); // Check every 15 minutes

    return () => {
      events.forEach(e => window.removeEventListener(e, updateInteraction));
      clearInterval(interval);
    };
  }, [isAdmin, user]);

  const signOut = async (revokeCurrentSession = true) => {
    try {
      const localSessionId = localStorage.getItem('adminSessionId');
      
      if (revokeCurrentSession && localSessionId && user) {
        // Run transaction to remove this session from tracker and mark revoked
        const trackerRef = doc(db, 'users', user.uid, 'sessionTracker', 'data');
        const sessionRef = doc(db, 'adminSessions', localSessionId);
        
        await runTransaction(db, async (transaction) => {
          const trackerDoc = await transaction.get(trackerRef);
          if (trackerDoc.exists()) {
            const activeSessionIds = trackerDoc.data().activeSessionIds || [];
            const newActiveSessionIds = activeSessionIds.filter((id: string) => id !== localSessionId);
            transaction.set(trackerRef, { activeSessionIds: newActiveSessionIds }, { merge: true });
          }
          
          transaction.delete(sessionRef);
        }).catch(console.error);
      }
    } finally {
      localStorage.removeItem('adminSessionId');
      await firebaseSignOut(auth);
      router.push('/admin/login');
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, isLoading, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
