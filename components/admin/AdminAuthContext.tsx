'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    let unsubscribeDoc: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Listen to changes in the user document in real-time
        unsubscribeDoc = onSnapshot(userDocRef, async (userDocSnap) => {
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            
            // Check session ID
            const localSessionId = localStorage.getItem('adminSessionId');
            if (userData.activeSessionId && localSessionId !== userData.activeSessionId) {
              // Another device/tab logged in
              setIsAdmin(false);
              await firebaseSignOut(auth);
              alert("You have been logged out because your account was accessed from another device or session.");
              return;
            }

            if (userData.role === 'admin' && userData.active === true) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
              await firebaseSignOut(auth);
            }
          } else {
            setIsAdmin(false);
            await firebaseSignOut(auth);
          }
          setIsLoading(false);
        }, async (error) => {
          console.error("Error fetching user role:", error);
          setIsAdmin(false);
          await firebaseSignOut(auth);
          setIsLoading(false);
        });

      } else {
        setIsAdmin(false);
        setIsLoading(false);
        if (unsubscribeDoc) unsubscribeDoc();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push('/admin/login');
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, isLoading, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
