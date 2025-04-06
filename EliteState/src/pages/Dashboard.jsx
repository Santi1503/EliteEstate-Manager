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
        const now = new Date();
        console.log("Fecha actual para comparación:", now);
        
        const userEventsQuery = query(
          eventosRef, 
          where("userId", "==", user.uid)
        );
        const userEventsSnapshot = await getDocs(userEventsQuery);
        console.log("Total de eventos del usuario:", userEventsSnapshot.size);
        
        // Obtener eventos futuros
        try {
          const futureEventsQuery = query(
            eventosRef, 
            where("userId", "==", user.uid),
            where("start", ">=", Timestamp.fromDate(now)),
            orderBy("start", "asc"),
            limit(5)
          );
          
          const futureEventsSnapshot = await getDocs(futureEventsQuery);
          console.log("Total de eventos futuros:", futureEventsSnapshot.size);
          
          const eventosData = futureEventsSnapshot.docs.map(doc => {
            const data = doc.data();
            console.log("Datos del evento:", data);
            
            // Verificar el tipo de datos de start y end
            console.log("Tipo de start:", typeof data.start, data.start instanceof Timestamp);
            console.log("Tipo de end:", typeof data.end, data.end instanceof Timestamp);
            
            return {
              id: doc.id,
              ...data,
              start: data.start instanceof Timestamp ? data.start.toDate() : new Date(data.start),
              end: data.end instanceof Timestamp ? data.end.toDate() : new Date(data.end)
            };
          });
          
          console.log("Eventos procesados:", eventosData);
          setProximosEventos(eventosData);
        } catch (indexError) {
          console.error("Error de índice:", indexError);
          
          // Como alternativa, mostrar todos los eventos del usuario sin filtrar por fecha
          const eventosData = userEventsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              start: data.start instanceof Timestamp ? data.start.toDate() : new Date(data.start),
              end: data.end instanceof Timestamp ? data.end.toDate() : new Date(data.end)
            };
          });
          
          // Ordenar por fecha de inicio
          eventosData.sort((a, b) => a.start - b.start);
          
          // Limitar a 5 eventos
          setProximosEventos(eventosData.slice(0, 5));
        }
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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
          <p className="text-gray-700">
            Bienvenido, {user?.nombre + " " + user?.apellido || user?.email}. Aquí tienes un resumen de tus próximos eventos y zonas recientes.
          </p>
        </div>

        {/* Próximos Eventos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Próximos Eventos</h3>
          
          {proximosEventos.length > 0 ? (
            <div className="space-y-4">
              {proximosEventos.map((evento) => (
                <div key={evento.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium">{evento.title}</h4>
                  <p className="text-sm text-gray-600">
                    {formatDate(evento.start)}
                  </p>
                  {evento.description && (
                    <p className="text-sm text-gray-500 mt-1">{evento.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tienes eventos programados.</p>
          )}
          
          <div className="mt-4">
            <Link 
              to="/agenda" 
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Ver todos los eventos →
            </Link>
          </div>
        </div>

        {/* Zonas Recientes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Zonas Recientes</h3>
          
          {zonas.length > 0 ? (
            <div className="space-y-4">
              {zonas.slice(0, 5).map(zona => (
                <div key={zona.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <div>
                    <h4 className="font-medium">{zona.nombre}</h4>
                    <p className="text-sm text-gray-600">{zona.propiedadesCount || 0} propiedades</p>
                  </div>
                  <Link
                    to={`/zonas/${zona.id}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Ver Zona
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay zonas recientes.</p>
          )}
          
          <div className="mt-4">
            <Link 
              to="/zonas" 
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Ver todas las zonas →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
