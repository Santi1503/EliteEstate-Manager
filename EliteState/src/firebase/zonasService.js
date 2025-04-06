import { db } from "./config";
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Obtener el ID del usuario actual
const getCurrentUserId = () => {
  const auth = getAuth();
  return auth.currentUser ? auth.currentUser.uid : null;
};

// Obtener todas las zonas del usuario actual
export const getZonas = async () => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Usuario no autenticado");
  
  const zonasRef = collection(db, "zonas");
  const q = query(zonasRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Crear una nueva zona
export const createZona = async (nombre) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Usuario no autenticado");
  
  const zonasRef = collection(db, "zonas");
  const newZona = await addDoc(zonasRef, { 
    nombre,
    userId,
    createdAt: new Date().toISOString()
  });
  return newZona;
};

// Obtener propiedades dentro de una zona específica
export const getPropiedadesPorZona = async (zonaId) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Usuario no autenticado");
  
  // Verificar que la zona pertenece al usuario actual
  const zonaRef = doc(db, "zonas", zonaId);
  const zonaDoc = await getDoc(zonaRef);
  
  if (!zonaDoc.exists()) {
    throw new Error("Zona no encontrada");
  }
  
  if (zonaDoc.data().userId !== userId) {
    throw new Error("No tienes permiso para ver esta zona");
  }
  
  const propiedadesRef = collection(db, "zonas", zonaId, "propiedades");
  const snapshot = await getDocs(propiedadesRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Crear una nueva propiedad en una zona específica
export const createPropiedad = async (zonaId, propiedad) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Usuario no autenticado");
  
  // Verificar que la zona pertenece al usuario actual
  const zonaRef = doc(db, "zonas", zonaId);
  const zonaDoc = await getDoc(zonaRef);
  
  if (!zonaDoc.exists()) {
    throw new Error("Zona no encontrada");
  }
  
  if (zonaDoc.data().userId !== userId) {
    throw new Error("No tienes permiso para agregar propiedades a esta zona");
  }
  
  const propiedadesRef = collection(db, "zonas", zonaId, "propiedades");
  const newPropiedad = await addDoc(propiedadesRef, {
    ...propiedad,
    userId,
    createdAt: new Date().toISOString()
  });
  return newPropiedad;
};

export const getPropiedadPorId = async (zonaId, propiedadId) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Usuario no autenticado");
  
  // Verificar que la zona pertenece al usuario actual
  const zonaRef = doc(db, "zonas", zonaId);
  const zonaDoc = await getDoc(zonaRef);
  
  if (!zonaDoc.exists()) {
    throw new Error("Zona no encontrada");
  }
  
  if (zonaDoc.data().userId !== userId) {
    throw new Error("No tienes permiso para ver esta zona");
  }
  
  const propiedadRef = doc(db, "zonas", zonaId, "propiedades", propiedadId);
  const docSnap = await getDoc(propiedadRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("Propiedad no encontrada");
  }
};

export const getPropiedadDetalle = async (zonaId, propiedadId) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Usuario no autenticado");
  
  // Verificar que la zona pertenece al usuario actual
  const zonaRef = doc(db, "zonas", zonaId);
  const zonaDoc = await getDoc(zonaRef);
  
  if (!zonaDoc.exists()) {
    throw new Error("Zona no encontrada");
  }
  
  if (zonaDoc.data().userId !== userId) {
    throw new Error("No tienes permiso para ver esta zona");
  }
  
  const docRef = doc(db, "zonas", zonaId, "propiedades", propiedadId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error("Propiedad no encontrada");
  }
  
  return { id: docSnap.id, ...docSnap.data() };
};

export const updateEstadoPropiedad = async (zonaId, propiedadId, nuevoEstado) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Usuario no autenticado");
  
  // Verificar que la zona pertenece al usuario actual
  const zonaRef = doc(db, "zonas", zonaId);
  const zonaDoc = await getDoc(zonaRef);
  
  if (!zonaDoc.exists()) {
    throw new Error("Zona no encontrada");
  }
  
  if (zonaDoc.data().userId !== userId) {
    throw new Error("No tienes permiso para modificar esta zona");
  }
  
  const docRef = doc(db, "zonas", zonaId, "propiedades", propiedadId);
  await updateDoc(docRef, { estado: nuevoEstado });
};

export const archivePropiedad = async (zonaId, propiedadId) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Usuario no autenticado");
  
  // Verificar que la zona pertenece al usuario actual
  const zonaRef = doc(db, "zonas", zonaId);
  const zonaDoc = await getDoc(zonaRef);
  
  if (!zonaDoc.exists()) {
    throw new Error("Zona no encontrada");
  }
  
  if (zonaDoc.data().userId !== userId) {
    throw new Error("No tienes permiso para modificar esta zona");
  }
  
  const propiedadRef = doc(db, "zonas", zonaId, "propiedades", propiedadId);
  await updateDoc(propiedadRef, { archived: true });
};

export const updatePropiedad = async (zonaId, propiedadId, propiedadData) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Usuario no autenticado");
  
  // Verificar que la zona pertenece al usuario actual
  const zonaRef = doc(db, "zonas", zonaId);
  const zonaDoc = await getDoc(zonaRef);
  
  if (!zonaDoc.exists()) {
    throw new Error("Zona no encontrada");
  }
  
  if (zonaDoc.data().userId !== userId) {
    throw new Error("No tienes permiso para modificar esta zona");
  }
  
  const propiedadRef = doc(db, "zonas", zonaId, "propiedades", propiedadId);
  await updateDoc(propiedadRef, propiedadData);
};

// Obtener una zona específica por ID
export const getZonaById = async (zonaId) => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error("Usuario no autenticado");
  
  const zonaRef = doc(db, "zonas", zonaId);
  const zonaDoc = await getDoc(zonaRef);
  
  if (!zonaDoc.exists()) {
    throw new Error("Zona no encontrada");
  }
  
  if (zonaDoc.data().userId !== userId) {
    throw new Error("No tienes permiso para ver esta zona");
  }
  
  return { id: zonaDoc.id, ...zonaDoc.data() };
};

