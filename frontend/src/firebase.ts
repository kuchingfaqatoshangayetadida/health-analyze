// src/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCgHmJ5KSqoKpYzW1Rp7z0EysIe4o-Dmso",
    authDomain: "health-analyze-669c7.firebaseapp.com",
    projectId: "health-analyze-669c7",
    storageBucket: "health-analyze-669c7.firebasestorage.app",
    messagingSenderId: "625899943816",
    appId: "1:625899943816:web:40512e169ff86258ebec3d",
    measurementId: "G-PXTP2E9MZ5",
    databaseURL: "https://health-analyze-669c7-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const googleProvider = new GoogleAuthProvider();
let analytics;

if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

export { app, auth, db, rtdb, googleProvider, analytics, firebaseConfig };
