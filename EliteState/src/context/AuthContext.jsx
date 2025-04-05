import React, { createContext, useState, useEffect, useContext } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  logoutUser,
  registerUser,
  getCurrentUser,
} from "../firebase/authService"; // Asegúrate de importar las funciones

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  // Escucha los cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Si el usuario está autenticado, lo guardamos
      } else {
        setUser(null); // Si no hay usuario autenticado, lo establecemos como null
        navigate("/login"); // Redirige a login si no hay sesión
      }
    });

    // Limpiar el listener cuando el componente se desmonte
    return () => unsubscribe();
  }, [auth, navigate]);

  const handleRegister = async (email, password) => {
    try {
      const userCredential = await registerUser(email, password);
      setUser(userCredential); // Establece el usuario en el estado
      navigate("/dashboard"); // Redirige al dashboard después de registro
    } catch (error) {
      console.error("Error registrando usuario:", error.message);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const userCredential = await loginUser(email, password);
      setUser(userCredential); // Establece el usuario en el estado
      navigate("/dashboard"); // Redirige al dashboard después de iniciar sesión
    } catch (error) {
      console.error("Error iniciando sesión:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null); // Limpia el usuario del estado
      navigate("/login"); // Redirige al login después de cerrar sesión
    } catch (error) {
      console.error("Error cerrando sesión:", error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, handleRegister, handleLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};
