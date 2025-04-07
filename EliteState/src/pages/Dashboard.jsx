import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { getZonas, getPropiedadesPorZona } from "../firebase/zonasService";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const Dashboard = () => {
  const { user } = useAuth();
  const [zonas, setZonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [proximosEventos, setProximosEventos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener zonas recientes
        const zonasData = await getZonas();
        
        // Obtener propiedades para cada zona
        const zonasConPropiedades = await Promise.all(
          zonasData.map(async (zona) => {
            try {
              const propiedades = await getPropiedadesPorZona(zona.id);
              return {
                ...zona,
                propiedadesCount: propiedades.length
              };
            } catch (error) {
              console.error(`Error al obtener propiedades para la zona ${zona.id}:`, error);
              return {
                ...zona,
                propiedadesCount: 0
              };
            }
          })
        );
        
        setZonas(zonasConPropiedades);
        
        // Obtener próximos eventos
        console.log("Usuario actual:", user?.uid);
        
        // Verificar si hay eventos en la colección
        const eventosRef = collection(db, "eventos");
        const allEventsQuery = query(eventosRef);
        const allEventsSnapshot = await getDocs(allEventsQuery);
        console.log("Total de eventos en la colección:", allEventsSnapshot.size);
        
        // Obtener eventos del usuario actual
        const now = new Date(); // Usar la hora actual
        console.log("Fecha y hora actual para comparación:", now);
        
        // Primero obtenemos todos los eventos del usuario
        const userEventsQuery = query(
          eventosRef, 
          where("userId", "==", user.uid)
        );
        
        const userEventsSnapshot = await getDocs(userEventsQuery);
        console.log("Total de eventos del usuario:", userEventsSnapshot.size);
        
        // Procesar todos los eventos y filtrar los futuros
        const eventosData = userEventsSnapshot.docs.map(doc => {
          const data = doc.data();
          const startDate = data.start instanceof Timestamp ? data.start.toDate() : new Date(data.start);
          const endDate = data.end instanceof Timestamp ? data.end.toDate() : new Date(data.end);
          
          return {
            id: doc.id,
            ...data,
            start: startDate,
            end: endDate
          };
        });
        
        // Filtrar eventos futuros y ordenarlos
        const eventosFiltrados = eventosData
          .filter(evento => {
            // Un evento es futuro si:
            // 1. Su fecha de inicio es posterior a ahora, o
            // 2. Su fecha de fin es posterior a ahora (evento en curso)
            return evento.end >= now;
          })
          .sort((a, b) => a.start - b.start)
          .slice(0, 5);
        
        console.log("Eventos filtrados:", eventosFiltrados.map(e => ({
          title: e.title,
          start: e.start.toString(),
          end: e.end.toString()
        })));
        
        setProximosEventos(eventosFiltrados);
        
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.uid) {
      fetchData();
    }
  }, [user?.uid]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
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
      <div className="space-y-4 md:space-y-6 px-2 md:px-4">
        <div>
          <h2 className="text-lg md:text-2xl font-bold mb-2">Dashboard</h2>
          <p className="text-xs md:text-base text-gray-700">
            Bienvenido, {user?.nombre + " " + user?.apellido || user?.email}. Aquí tienes un resumen de tus próximos eventos y zonas recientes.
          </p>
        </div>

        {/* Próximos Eventos */}
        <div className="bg-white p-3 md:p-6 rounded-lg shadow">
          <h3 className="text-base md:text-xl font-semibold mb-3 md:mb-4">Próximos Eventos</h3>
          
          {proximosEventos.length > 0 ? (
            <div className="space-y-2 md:space-y-4">
              {proximosEventos.map((evento) => (
                <div key={evento.id} className="border-l-4 border-blue-500 pl-3 md:pl-4 py-2">
                  <h4 className="font-medium text-sm md:text-base">{evento.title}</h4>
                  <p className="text-xs md:text-sm text-gray-600">
                    {formatDate(evento.start)}
                  </p>
                  {evento.description && (
                    <p className="text-xs md:text-sm text-gray-500 mt-1">{evento.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs md:text-base text-gray-500">No tienes eventos programados.</p>
          )}
          
          <div className="mt-3 md:mt-4">
            <Link 
              to="/agenda" 
              className="text-blue-500 hover:text-blue-700 font-medium text-xs md:text-base inline-flex items-center"
            >
              Ver todos los eventos
              <svg className="w-3 h-3 md:w-4 md:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Zonas Recientes */}
        <div className="bg-white p-3 md:p-6 rounded-lg shadow">
          <h3 className="text-base md:text-xl font-semibold mb-3 md:mb-4">Zonas Recientes</h3>
          
          {zonas.length > 0 ? (
            <div className="space-y-2 md:space-y-4">
              {zonas.slice(0, 5).map(zona => (
                <div key={zona.id} className="flex flex-col md:flex-row md:justify-between md:items-center p-2 md:p-4 bg-gray-50 rounded">
                  <div className="mb-2 md:mb-0">
                    <h4 className="font-medium text-sm md:text-base">{zona.nombre}</h4>
                    <p className="text-xs md:text-sm text-gray-600">{zona.propiedadesCount || 0} propiedades</p>
                  </div>
                  <Link
                    to={`/zona/${zona.id}`}
                    className="w-full md:w-auto text-center px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs md:text-base"
                  >
                    Ver Zona
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs md:text-base text-gray-500">No hay zonas recientes.</p>
          )}
          
          <div className="mt-3 md:mt-4">
            <Link 
              to="/zonas" 
              className="text-blue-500 hover:text-blue-700 font-medium text-xs md:text-base inline-flex items-center"
            >
              Ver todas las zonas
              <svg className="w-3 h-3 md:w-4 md:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
