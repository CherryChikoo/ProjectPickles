'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, onSnapshot, runTransaction, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

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
                alert("Your session has been revoked from another device.");
                setIsAdmin(false);
                await signOut(false); // don't try to revoke it again
              } else {
                // Heartbeat: update lastActiveAt every ~10 mins if active
                const lastActive = sessionData.lastActiveAt?.toMillis() || 0;
                if (Date.now() - lastActive > 10 * 60 * 1000) {
                  updateDoc(sessionRef, { lastActiveAt: serverTimestamp() }).catch(console.error);
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
          
          transaction.set(sessionRef, { 
            revoked: true, 
            revokedAt: serverTimestamp() 
          }, { merge: true });
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
