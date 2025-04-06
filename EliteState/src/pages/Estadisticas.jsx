import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { getZonas, getPropiedadesPorZona } from "../firebase/zonasService";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Registrar los componentes necesarios para Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Función para generar colores HSL dinámicamente
const generateColor = (index) => {
  // Usamos el índice para generar un color único
  // Multiplicamos por el número áureo (1.618033988749895) para distribuir mejor los colores
  const hue = (index * 137.508) % 360; // 137.508 es aproximadamente el ángulo áureo en grados
  return {
    bg: `hsla(${hue}, 70%, 50%, 0.6)`,
    border: `hsla(${hue}, 70%, 50%, 1)`
  };
};

const Estadisticas = () => {
  const [zonas, setZonas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPropiedades, setTotalPropiedades] = useState(0);
  const [propiedadesEnVenta, setPropiedadesEnVenta] = useState(0);
  const [propiedadesEnRenta, setPropiedadesEnRenta] = useState(0);
  const [zonasConPropiedades, setZonasConPropiedades] = useState(0);
  const [zonasSinPropiedades, setZonasSinPropiedades] = useState(0);
  const [zonasConDatos, setZonasConDatos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const zonasData = await getZonas();
        setZonas(zonasData);
        
        // Obtener propiedades para cada zona
        let totalProps = 0;
        let propsVenta = 0;
        let propsRenta = 0;
        let zonasConProps = 0;
        const zonasConPropiedadesData = [];
        
        for (const zona of zonasData) {
          try {
            const propiedades = await getPropiedadesPorZona(zona.id);
            const numPropiedades = propiedades.length;
            totalProps += numPropiedades;
            
            // Contar propiedades por estado
            let ventaCount = 0;
            let rentaCount = 0;
            propiedades.forEach(prop => {
              if (prop.estado === "Venta") ventaCount++;
              if (prop.estado === "Renta") rentaCount++;
            });
            
            propsVenta += ventaCount;
            propsRenta += rentaCount;
            
            // Contar zonas con propiedades
            if (numPropiedades > 0) {
              zonasConProps++;
              zonasConPropiedadesData.push({
                id: zona.id,
                nombre: zona.nombre,
                numPropiedades,
                ventaCount,
                rentaCount
              });
            }
          } catch (error) {
            console.error(`Error al obtener propiedades para la zona ${zona.id}:`, error);
          }
        }
        
        setTotalPropiedades(totalProps);
        setPropiedadesEnVenta(propsVenta);
        setPropiedadesEnRenta(propsRenta);
        setZonasConPropiedades(zonasConProps);
        setZonasSinPropiedades(zonasData.length - zonasConProps);
        setZonasConDatos(zonasConPropiedadesData);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Datos para la gráfica de pastel de propiedades por zona
  const pieChartDataPropiedades = {
    labels: zonasConDatos.map(zona => zona.nombre),
    datasets: [
      {
        data: zonasConDatos.map(zona => zona.numPropiedades),
        backgroundColor: zonasConDatos.map((_, index) => generateColor(index).bg),
        borderColor: zonasConDatos.map((_, index) => generateColor(index).border),
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptionsPropiedades = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Propiedades por Zona',
        font: {
          size: 16,
        },
      },
    },
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
          <h2 className="text-2xl font-bold mb-2">Estadísticas</h2>
          <p className="text-gray-700">
            Aquí tienes un resumen detallado de tus propiedades y zonas.
          </p>
        </div>

        {/* Sección de Estadísticas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Resumen General</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800">Total de Zonas</h4>
              <p className="text-2xl font-bold text-blue-600">{zonas.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-800">Total de Propiedades</h4>
              <p className="text-2xl font-bold text-green-600">{totalPropiedades}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800">Propiedades en Venta</h4>
              <p className="text-2xl font-bold text-yellow-600">{propiedadesEnVenta}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-800">Propiedades en Renta</h4>
              <p className="text-2xl font-bold text-purple-600">{propiedadesEnRenta}</p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-center">Propiedades por Zona</h3>
              <Pie data={pieChartDataPropiedades} options={pieChartOptionsPropiedades} />
            </div>
          </div>
        </div>

        {/* Tabla de detalles por zona */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Detalles por Zona</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zona
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Propiedades
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    En Venta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    En Renta
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {zonasConDatos.map((zona) => (
                  <tr key={zona.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {zona.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {zona.numPropiedades}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {zona.ventaCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {zona.rentaCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Estadisticas; 