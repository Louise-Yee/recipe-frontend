"use client";

// src/config/firebase.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { useEffect, useState } from "react";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once and only on the client side
let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;

// Check if we're in the browser environment
if (typeof window !== "undefined") {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
}

// Create a helper to use Firebase Auth with better error handling
export const useFirebaseAuth = () => {
  const [firebaseUser, setFirebaseUser] = useState<
    FirebaseUser | null | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setFirebaseUser(user);
        setLoading(false);
      },
      (error) => {
        console.error("Firebase auth state error:", error);
        setFirebaseUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { firebaseUser, loading };
};

export { app, auth };
