import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { 
  requestNotificationPermission, 
  scheduleReminder, 
  sendNotification, 
  formatReminderTime,
  getPendingReminders
} from "../firebase/notificationsService";

const REMINDER_OPTIONS = [
  { label: "1 día antes", value: 1440 }, // minutos
  { label: "6 horas antes", value: 360 },
  { label: "3 horas antes", value: 180 },
  { label: "1 hora antes", value: 60 },
  { label: "30 minutos antes", value: 30 },
  { label: "15 minutos antes", value: 15 },
  { label: "10 minutos antes", value: 10 },
];

const Agenda = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    attendees: "",
    start: "",
    end: "",
    reminders: [],
  });
  const [notificationPermission, setNotificationPermission] = useState("default");
  const calendarRef = useRef(null);
  const currentTimeRef = useRef(null);

  useEffect(() => {
    fetchEvents();
    checkNotificationPermission();
    setupCurrentTimeIndicator();
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      if (currentTimeRef.current) {
        clearInterval(currentTimeRef.current);
      }
    };
  }, []);

  // Efecto para posicionar el calendario en la hora actual al cargar
  useEffect(() => {
    if (!isLoading && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      
      // Si estamos en vista de día o semana, desplazar a la hora actual
      if (calendarApi.view.type.includes("timeGrid")) {
        const now = new Date();
        calendarApi.gotoDate(now);
        
        // Desplazar a la hora actual
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const scrollTo = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
        
        // Usar setTimeout para asegurar que el calendario esté completamente renderizado
        setTimeout(() => {
          const timeGridEl = document.querySelector('.fc-timegrid-body');
          if (timeGridEl) {
            const timeSlots = timeGridEl.querySelectorAll('.fc-timegrid-slot');
            const currentSlot = Array.from(timeSlots).find(slot => {
              const timeLabel = slot.querySelector('.fc-timegrid-slot-label');
              return timeLabel && timeLabel.textContent.includes(scrollTo);
            });
            
            if (currentSlot) {
              currentSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }, 100);
      }
    }
  }, [isLoading]);

  const checkNotificationPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    
    if (permission === "granted") {
      toast.success("Notificaciones activadas correctamente");
    } else if (permission === "denied") {
      toast.warning("Las notificaciones están desactivadas. Algunas funciones pueden no estar disponibles.");
    }
  };

  const setupCurrentTimeIndicator = () => {
    // Crear un intervalo para actualizar la posición de la línea de tiempo actual
    currentTimeRef.current = setInterval(() => {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi && calendarApi.view.type.includes("timeGrid")) {
        // La línea de tiempo actual se maneja automáticamente por FullCalendar
        // cuando se establece nowIndicator: true
      }
    }, 60000); // Actualizar cada minuto
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const eventsRef = collection(db, "eventos");
      const q = query(eventsRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      const eventsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        start: doc.data().start.toDate(),
        end: doc.data().end.toDate(),
      }));
      
      setEvents(eventsData);
      
      // Programar recordatorios para eventos futuros
      scheduleReminders(eventsData);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
      toast.error("Error al cargar los eventos");
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleReminders = async (eventsData) => {
    const now = new Date();
    
    for (const event of eventsData) {
      if (!event.reminders || event.reminders.length === 0) continue;
      
      const eventStart = new Date(event.start);
      
      // Solo programar recordatorios para eventos futuros
      if (eventStart > now) {
        for (const reminderMinutes of event.reminders) {
          const reminderTime = new Date(eventStart);
          reminderTime.setMinutes(reminderTime.getMinutes() - reminderMinutes);
          
          // Solo programar recordatorios futuros
          if (reminderTime > now) {
            try {
              await scheduleReminder(
                event.id,
                event.title,
                reminderTime,
                reminderMinutes
              );
            } catch (error) {
              console.error(`Error al programar recordatorio para ${event.title}:`, error);
            }
          }
        }
      }
    }
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedDate(selectInfo);
    resetEventForm();
    setEventForm(prev => ({
      ...prev,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    }));
    setIsEditing(false);
    setShowEventForm(true);
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setShowEventDetails(true);
  };

  const handleEventDelete = async (eventId) => {
    try {
      await deleteDoc(doc(db, "eventos", eventId));
      toast.success("Evento eliminado exitosamente");
      setShowEventDetails(false);
      fetchEvents();
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      toast.error("Error al eliminar el evento");
    }
  };

  const handleStartDateChange = (e) => {
    const startValue = e.target.value;
    setEventForm(prev => {
      // Siempre actualizar la fecha de fin para que coincida con la fecha de inicio
      return {
        ...prev,
        start: startValue,
        end: startValue
      };
    });
  };

  const handleEditEvent = () => {
    if (!selectedEvent) return;
    
    // Formatear las fechas para el input datetime-local
    const formatDateForInput = (date) => {
      // Asegurarse de que date es un objeto Date
      const d = date instanceof Date ? date : new Date(date);
      
      // Formatear la fecha en formato YYYY-MM-DDThh:mm
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    // Asegurarse de que start y end son objetos Date
    const startDate = selectedEvent.start instanceof Date ? selectedEvent.start : new Date(selectedEvent.start);
    const endDate = selectedEvent.end instanceof Date ? selectedEvent.end : new Date(selectedEvent.end);
    
    console.log('Evento original:', {
      title: selectedEvent.title,
      start: startDate,
      end: endDate
    });
    
    setEventForm({
      title: selectedEvent.title,
      description: selectedEvent.extendedProps.description || "",
      attendees: selectedEvent.extendedProps.attendees || "",
      start: formatDateForInput(startDate),
      end: formatDateForInput(endDate),
      reminders: selectedEvent.extendedProps.reminders || [],
    });
    
    console.log('Formulario después de editar:', {
      title: selectedEvent.title,
      start: formatDateForInput(startDate),
      end: formatDateForInput(endDate)
    });
    
    setIsEditing(true);
    setShowEventDetails(false);
    setShowEventForm(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que la hora de fin no sea anterior a la hora de inicio
    const startDate = new Date(eventForm.start);
    const endDate = new Date(eventForm.end);
    
    if (endDate <= startDate) {
      toast.error("La hora de fin debe ser posterior a la hora de inicio");
      return;
    }
    
    try {
      const eventData = {
        ...eventForm,
        userId: user.uid,
        start: new Date(eventForm.start),
        end: new Date(eventForm.end),
        createdAt: new Date(),
      };

      if (isEditing && selectedEvent) {
        // Actualizar evento existente
        await updateDoc(doc(db, "eventos", selectedEvent.id), {
          title: eventData.title,
          description: eventData.description,
          attendees: eventData.attendees,
          start: eventData.start,
          end: eventData.end,
          reminders: eventData.reminders,
          updatedAt: new Date(),
        });
        
        toast.success("Evento actualizado exitosamente");
      } else {
        // Crear nuevo evento
        const docRef = await addDoc(collection(db, "eventos"), eventData);
        
        // Programar recordatorios para el nuevo evento
        const newEvent = {
          id: docRef.id,
          ...eventData,
          start: eventData.start,
          end: eventData.end,
        };
        
        await scheduleReminders([newEvent]);
        
        toast.success("Evento creado exitosamente");
      }

      // Reiniciar el formulario y cerrar el modal
      resetEventForm();
      setShowEventForm(false);
      fetchEvents();
    } catch (error) {
      console.error("Error al guardar evento:", error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} el evento`);
    }
  };

  const handleReminderToggle = (minutes) => {
    setEventForm(prev => ({
      ...prev,
      reminders: prev.reminders.includes(minutes)
        ? prev.reminders.filter(m => m !== minutes)
        : [...prev.reminders, minutes]
    }));
  };

  const formatEventTime = (date) => {
    return new Date(date).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getReminderLabels = (reminders) => {
    if (!reminders || reminders.length === 0) return "Sin recordatorios";
    
    return reminders.map(minutes => {
      const option = REMINDER_OPTIONS.find(opt => opt.value === minutes);
      return option ? option.label : `${minutes} minutos antes`;
    }).join(", ");
  };

  // Función para cambiar a la vista de día y posicionar en la hora actual
  const goToCurrentTime = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView('timeGridDay');
      
      const now = new Date();
      calendarApi.gotoDate(now);
      
      // Desplazar a la hora actual
      setTimeout(() => {
        const timeGridEl = document.querySelector('.fc-timegrid-body');
        if (timeGridEl) {
          const timeSlots = timeGridEl.querySelectorAll('.fc-timegrid-slot');
          const currentSlot = Array.from(timeSlots).find(slot => {
            const timeLabel = slot.querySelector('.fc-timegrid-slot-label');
            return timeLabel && timeLabel.textContent.includes(`${now.getHours()}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()}`);
          });
          
          if (currentSlot) {
            currentSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  };

  const resetEventForm = () => {
    setEventForm({
      title: "",
      description: "",
      attendees: "",
      start: "",
      end: "",
      reminders: [],
    });
    setSelectedDate(null);
    setSelectedEvent(null);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Agenda</h2>
            <p className="text-gray-700">
              Gestiona tus citas, reuniones y actividades.
            </p>
          </div>
          <div className="flex space-x-2">
            {notificationPermission !== "granted" && (
              <button
                onClick={checkNotificationPermission}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Activar Notificaciones
              </button>
            )}
            <button
              onClick={goToCurrentTime}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Ir a Hora Actual
            </button>
            <button
              onClick={() => {
                resetEventForm();
                setShowEventForm(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Agregar Evento
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            initialView="timeGridWeek"
            firstDay={1}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events}
            select={handleDateSelect}
            eventClick={handleEventClick}
            nowIndicator={true}
            locale="es"
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            allDaySlot={true}
            height="auto"
            expandRows={true}
            stickyHeaderDates={true}
            dayHeaderFormat={{ weekday: 'long' }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
          />
        </div>

        {/* Modal de formulario de evento */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">
                {isEditing ? "Editar Evento" : (selectedDate ? "Nuevo Evento" : "Agregar Evento")}
              </h3>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Título
                  </label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Personas que acompañarán
                  </label>
                  <input
                    type="text"
                    value={eventForm.attendees}
                    onChange={(e) => setEventForm(prev => ({ ...prev, attendees: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Separar nombres con comas"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fecha y hora de inicio
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={eventForm.start}
                      onChange={handleStartDateChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fecha y hora de fin
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={eventForm.end}
                      min={eventForm.start}
                      onChange={(e) => setEventForm(prev => ({ ...prev, end: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recordatorios
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {REMINDER_OPTIONS.map(option => (
                      <label key={option.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={eventForm.reminders.includes(option.value)}
                          onChange={() => handleReminderToggle(option.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      resetEventForm();
                      setShowEventForm(false);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {isEditing ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de detalles del evento */}
        {showEventDetails && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-6 max-w-md w-full shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-4">{selectedEvent.title}</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Fecha y hora</h4>
                  <p className="mt-1">
                    {formatEventTime(selectedEvent.start)} - {formatEventTime(selectedEvent.end)}
                  </p>
                </div>
                
                {selectedEvent.extendedProps.description && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Descripción</h4>
                    <p className="mt-1">{selectedEvent.extendedProps.description}</p>
                  </div>
                )}
                
                {selectedEvent.extendedProps.attendees && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Personas que acompañarán</h4>
                    <p className="mt-1">{selectedEvent.extendedProps.attendees}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Recordatorios</h4>
                  <p className="mt-1">{getReminderLabels(selectedEvent.extendedProps.reminders)}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleEditEvent}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("¿Estás seguro de que deseas eliminar este evento?")) {
                      handleEventDelete(selectedEvent.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" />
    </Layout>
  );
};

export default Agenda;
