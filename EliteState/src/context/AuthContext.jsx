import React, { createContext, useState, useEffect, useContext } from "react";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  logoutUser,
  registerUser,
  getCurrentUser,
} from "../firebase/authService"; // Asegúrate de importar las funciones
import { auth, db } from "../firebase/config";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged,
  setPersistence as firebaseSetPersistence,
  browserLocalPersistence as firebaseBrowserLocalPersistence
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  // Configurar persistencia de sesión
  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Configurar persistencia local (el token durará hasta que el usuario cierre sesión o se elimine)
        await firebaseSetPersistence(auth, firebaseBrowserLocalPersistence);
      } catch (error) {
        console.error("Error configurando persistencia:", error);
      }
    };
    
    setupAuth();
  }, [auth]);

  // Escucha los cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = firebaseOnAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Obtener datos adicionales del usuario desde Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const userData = userDoc.data();
        setUser({
          ...currentUser,
          nombre: userData?.nombre || "",
          apellido: userData?.apellido || ""
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Limpiar el listener cuando el componente se desmonte
    return () => unsubscribe();
  }, [auth]);

  // Redirigir al usuario según su estado de autenticación
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Si el usuario está en la página de login o registro, redirigir al dashboard
        if (window.location.pathname === '/login' || window.location.pathname === '/register') {
          navigate("/dashboard");
        }
      } else {
        // Si el usuario no está autenticado y no está en login o registro, redirigir a login
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          navigate("/login");
        }
      }
    }
  }, [user, loading, navigate]);

  const handleRegister = async (email, password, nombre, apellido) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Guardar datos adicionales en Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        nombre,
        apellido,
        email,
        createdAt: new Date().toISOString()
      });

      setUser(userCredential); // Establece el usuario en el estado
      navigate("/dashboard"); // Redirige al dashboard después de registro
      return userCredential;
    } catch (error) {
      console.error("Error registrando usuario:", error.message);
      throw error;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential); // Establece el usuario en el estado
      navigate("/dashboard"); // Redirige al dashboard después de iniciar sesión
      return userCredential;
    } catch (error) {
      console.error("Error iniciando sesión:", error.message);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Limpia el usuario del estado
      navigate("/login"); // Redirige al login después de cerrar sesión
    } catch (error) {
      console.error("Error cerrando sesión:", error.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    handleRegister,
    handleLogin,
    handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};
