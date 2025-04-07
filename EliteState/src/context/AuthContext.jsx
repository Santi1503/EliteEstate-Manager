import React, { createContext, useState, useEffect, useContext } from "react";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Obtener datos adicionales del usuario desde Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        
        setUser({
          ...user,
          nombre: userData?.nombre || "",
          apellido: userData?.apellido || "",
          emailVerified: user.emailVerified
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleRegister = async (email, password, nombre, apellido) => {
    try {
      const auth = getAuth();
      await setPersistence(auth, browserLocalPersistence);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Enviar correo de verificación
      await sendEmailVerification(userCredential.user);
      
      // Guardar datos adicionales en Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        nombre,
        apellido,
        email,
        emailVerified: false,
        createdAt: new Date().toISOString()
      });

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const auth = getAuth();
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/";
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setUser(null);
      // Usar window.location para redirigir después de cerrar sesión
      window.location.href = "/";
    } catch (error) {
      throw error;
    }
  };

  const handlePasswordReset = async (email) => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    handleRegister,
    handleLogin,
    handleLogout,
    handlePasswordReset
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
