// src/contexts/auth-context.tsx

import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth, googleProvider, db, rtdb } from '../firebase';
import { ref, onValue, onDisconnect, set, serverTimestamp as rtdbTimestamp } from 'firebase/database';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';

// Foydalanuvchi rollari
export type UserRole = 'user' | 'doctor' | 'admin';

// Foydalanuvchi interfeysi
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Auth Context interfeysi
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
}

// Auth Context yaratish
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider komponenti
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Firebase Auth holatini kuzatish
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          const doctorsSnap = await getDocs(collection(db, 'doctors'));
          const doctorData = doctorsSnap.docs.find(d => d.data().email === firebaseUser.email);
          const isAdmin = firebaseUser.email === 'admin@gmail.com';

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            const newRole = isAdmin ? 'admin' : (doctorData ? 'doctor' : userData.role);
            const finalId = doctorData ? doctorData.id : firebaseUser.uid;

            if (userData.role !== newRole || userData.id !== finalId) {
              const updatedUser = { ...userData, id: finalId, role: newRole as UserRole };
              await setDoc(doc(db, 'users', finalId), updatedUser, { merge: true });
              setUser(updatedUser);
            } else {
              setUser({ ...userData, id: finalId });
            }
          } else {
            const finalId = doctorData ? doctorData.id : firebaseUser.uid;
            const newUser: User = {
              id: finalId,
              name: doctorData ? doctorData.data().name : (isAdmin ? 'Admin' : (firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User')),
              email: firebaseUser.email || '',
              role: (isAdmin ? 'admin' : (doctorData ? 'doctor' : 'user')) as UserRole,
              avatar: firebaseUser.photoURL || (doctorData ? doctorData.data().avatar : `https://i.pinimg.com/736x/89/90/48/899048ab0cc455154006fdb9676964b3.jpg`)
            };

            await setDoc(doc(db, 'users', finalId), newUser);
            setUser(newUser);
          }
        } catch (error) {
          console.error("Auth sync error:", error);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Presence logic
  useEffect(() => {
    if (!user) return;

    // Use the actual Firebase Auth UID for the presence path to match security rules
    const presenceId = auth.currentUser?.uid || user.id;
    const userStatusRef = ref(rtdb, `/status/${presenceId}`);
    const connectedRef = ref(rtdb, '.info/connected');

    console.log("Setting up presence for user (PresenceID):", presenceId);

    const unsubscribeConnected = onValue(connectedRef, (snap) => {
      const isConnected = snap.val();
      console.log("RTDB Connection status changed:", isConnected);

      if (isConnected === true) {
        onDisconnect(userStatusRef).set({
          state: 'offline',
          lastChanged: rtdbTimestamp(),
        }).then(() => {
          console.log("Successfully registered onDisconnect hook for", presenceId);
          set(userStatusRef, {
            state: 'online',
            lastChanged: rtdbTimestamp(),
          }).catch(err => console.error("Error setting online status:", err));
        }).catch(err => console.error("Error setting onDisconnect hook:", err));
      }
    }, (err) => {
      console.error("Error listening to .info/connected:", err);
    });

    return () => {
      console.log("Cleaning up presence for user:", presenceId);
      unsubscribeConnected();
      set(userStatusRef, {
        state: 'offline',
        lastChanged: rtdbTimestamp(),
      });
    };
  }, [user]);

  // Email va parol bilan kirish
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Google bilan kirish
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  // Ro'yxatdan o'tish
  const register = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Doctors kolleksiyasidan qidirib ko'ramiz (email orqali)
    const doctorsSnap = await getDocs(collection(db, 'doctors'));
    const doctorData = doctorsSnap.docs.find(d => d.data().email === email);
    const isAdmin = email === 'admin@gmail.com';

    const newUser: User = {
      id: firebaseUser.uid,
      name: doctorData ? doctorData.data().name : name,
      email,
      role: (isAdmin ? 'admin' : (doctorData ? 'doctor' : 'user')) as UserRole,
      avatar: `https://i.pinimg.com/736x/89/90/48/899048ab0cc455154006fdb9676964b3.jpg`
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    await updateProfile(firebaseUser, { displayName: name });
    setUser(newUser);
  };

  // Tizimdan chiqish
  const logout = async () => {
    await signOut(auth);
  };

  // Foydalanuvchi ma'lumotlarini yangilash
  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) return;

    const newUser = { ...user, ...updatedData };
    await setDoc(doc(db, 'users', user.id), newUser);

    if (updatedData.name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: updatedData.name });
    }

    setUser(newUser);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// `useAuth` custom hook'i
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};