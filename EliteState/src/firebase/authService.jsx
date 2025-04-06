import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { app } from "./config";

const auth = getAuth(app);

// Configurar persistencia de sesión
export const setupAuthPersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.error("Error configurando persistencia:", error);
    throw error;
  }
};

// Función para registrar un nuevo usuario
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error registrando usuario:", error.message);
    throw error;
  }
};

// Función para iniciar sesión
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error iniciando sesión:", error.message);
    throw error;
  }
};

// Función para cerrar sesión
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error cerrando sesión:", error.message);
    throw error;
  }
};

// Función para obtener el usuario actual
export const getCurrentUser = () => {
  return auth.currentUser;
};
