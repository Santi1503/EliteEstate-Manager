import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { getZonas, getPropiedadesPorZona } from "../firebase/zonasService";

const Dashboard = () => {
  const { user } = useAuth();
  const [zonas, setZonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
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
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <h2 className="text-2xl font-bold mb-2">Bienvenid@, {user?.nombre} {user?.apellido}</h2>
          <p className="text-gray-700">
            Aquí tienes un resumen de tus zonas recientes.
          </p>
        </div>

        {/* Sección de Zonas Recientes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Zonas Recientes</h3>
          <div className="space-y-4">
            {zonas.slice(0, 5).map(zona => (
              <div key={zona.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <div>
                  <h4 className="font-medium">{zona.nombre}</h4>
                  <p className="text-sm text-gray-600">{zona.propiedadesCount || 0} propiedades</p>
                </div>
                <button
                  onClick={() => window.location.href = `/zona/${zona.id}`}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Ver Zona
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
