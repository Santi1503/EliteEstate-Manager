import { db } from "./config";
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, } from "firebase/firestore";

// Obtener todas las zonas
export const getZonas = async () => {
  const zonasRef = collection(db, "zonas");
  const snapshot = await getDocs(zonasRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Crear una nueva zona
export const createZona = async (nombre) => {
  const zonasRef = collection(db, "zonas");
  const newZona = await addDoc(zonasRef, { nombre });
  return newZona;
};

// Obtener propiedades dentro de una zona específica
export const getPropiedadesPorZona = async (zonaId) => {
  const propiedadesRef = collection(db, "zonas", zonaId, "propiedades");
  const snapshot = await getDocs(propiedadesRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Crear una nueva propiedad en una zona específica
export const createPropiedad = async (zonaId, propiedad) => {
  const propiedadesRef = collection(db, "zonas", zonaId, "propiedades");
  const newPropiedad = await addDoc(propiedadesRef, propiedad);
  return newPropiedad;
};

export const getPropiedadPorId = async (zonaId, propiedadId) => {
  const propiedadRef = doc(db, "zonas", zonaId, "propiedades", propiedadId);
  const docSnap = await getDoc(propiedadRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("Propiedad no encontrada")
  }
}

export const getPropiedadDetalle = async (zonaId, propiedadId) => {
  const docRef = doc(db, "zonas", zonaId, "propiedades", propiedadId);
  const docSnap = await getDoc(docRef);
  return {id: docSnap.id, ...docSnap.data()}
}

export const updateEstadoPropiedad = async (zonaId, propiedadId, nuevoEstado) => {
  const docRef = doc(db, "zonas", zonaId, "propiedades", propiedadId);
  await updateDoc(docRef, { estado: nuevoEstado })
}

export const archivePropiedad = async (zonaId, propiedadId) => {
  const propiedadRef = doc(db, "zonas", zonaId, "propiedades", propiedadId);
  await updateDoc(propiedadRef, { archived: true });
}

export const updatePropiedad = async (zonaId, propiedadId, propiedadData) => {
  const propiedadRef = doc(db, "zonas", zonaId, "propiedades", propiedadId);
  await updateDoc(propiedadRef, propiedadData);
}

