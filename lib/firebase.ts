import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8WXz63Bsf1VV1sy7sY7Rx40zMd4z0TBU",
  authDomain: "lmsv2-6440d.firebaseapp.com",
  projectId: "lmsv2-6440d",
  storageBucket: "lmsv2-6440d.firebasestorage.app",
  messagingSenderId: "1044631403962",
  appId: "1:1044631403962:web:d1e0c9fb624a5b6e1c3183",
  measurementId: "G-RS4VXBLQP1"
};

import { getAuth } from "firebase/auth";

// Initialize Firebase only if it hasn't been initialized already (crucial for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Analytics only on the client side since it relies on the window object
let analytics: Analytics | undefined;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics, db, auth };
