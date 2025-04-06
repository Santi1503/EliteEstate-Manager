import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "./config";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

// Función para solicitar permiso de notificaciones
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("Este navegador no soporta notificaciones del sistema");
    return "unsupported";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error al solicitar permiso de notificaciones:", error);
    return "denied";
  }
};

// Función para programar un recordatorio
export const scheduleReminder = async (eventId, eventTitle, reminderTime, reminderMinutes) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  try {
    // Guardar el recordatorio en Firestore
    const reminderData = {
      userId: user.uid,
      eventId,
      eventTitle,
      reminderTime: Timestamp.fromDate(reminderTime),
      reminderMinutes,
      status: "pending",
      createdAt: Timestamp.now(),
    };

    await addDoc(collection(db, "recordatorios"), reminderData);

    // Programar la notificación local
    const now = new Date();
    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    if (timeUntilReminder > 0) {
      setTimeout(() => {
        sendNotification(eventId, eventTitle, reminderMinutes);
      }, timeUntilReminder);
    }

    return true;
  } catch (error) {
    console.error("Error al programar recordatorio:", error);
    throw error;
  }
};

// Función para enviar una notificación
export const sendNotification = async (eventId, eventTitle, reminderMinutes) => {
  try {
    // Mostrar notificación del sistema si está permitida
    if (Notification.permission === "granted") {
      const notification = new Notification(`Recordatorio: ${eventTitle}`, {
        body: `El evento "${eventTitle}" comienza en ${formatReminderTime(reminderMinutes)}`,
        icon: "/favicon.ico",
        tag: `event-${eventId}-${reminderMinutes}`,
        renotify: true,
      });
      
      notification.onclick = function() {
        window.focus();
        this.close();
      };
    }
    
    // Mostrar toast como respaldo
    toast.info(`Recordatorio: ${eventTitle} comienza en ${formatReminderTime(reminderMinutes)}`);

    // Marcar el recordatorio como enviado
    const remindersRef = collection(db, "recordatorios");
    const q = query(
      remindersRef,
      where("eventId", "==", eventId),
      where("reminderMinutes", "==", reminderMinutes),
      where("status", "==", "pending")
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
      await markReminderAsSent(document.id);
    });
  } catch (error) {
    console.error("Error al enviar notificación:", error);
    throw error;
  }
};

// Función para formatear el tiempo del recordatorio
export const formatReminderTime = (minutes) => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? "1 hora" : `${hours} horas`;
  } else {
    return `${minutes} minutos`;
  }
};

// Función para obtener todos los recordatorios pendientes
export const getPendingReminders = async (userId) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error("Usuario no autenticado");
  }

  try {
    const remindersRef = collection(db, "recordatorios");
    const q = query(
      remindersRef,
      where("status", "==", "pending"),
      where("reminderTime", ">", Timestamp.now())
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      reminderTime: doc.data().reminderTime.toDate(),
    }));
  } catch (error) {
    console.error("Error al obtener recordatorios pendientes:", error);
    throw error;
  }
};

// Función para marcar un recordatorio como enviado
export const markReminderAsSent = async (reminderId) => {
  try {
    const reminderRef = doc(db, "recordatorios", reminderId);
    await updateDoc(reminderRef, {
      status: "sent",
      sentAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error al marcar recordatorio como enviado:", error);
    throw error;
  }
};

// Función para eliminar un recordatorio
export const deleteReminder = async (reminderId) => {
  try {
    const reminderRef = doc(db, "recordatorios", reminderId);
    await deleteDoc(reminderRef);
  } catch (error) {
    console.error("Error al eliminar recordatorio:", error);
    throw error;
  }
}; 