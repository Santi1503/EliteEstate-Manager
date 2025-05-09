import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import {
  getZonas,
  getPropiedadesPorZona,
  createZona,
} from "../firebase/zonasService";
import { Link } from "react-router-dom"; // Importar Link de react-router-dom

const Catalogo = () => {
  const [zonas, setZonas] = useState([]);
  const [nuevaZona, setNuevaZona] = useState("");
  const [search, setSearch] = useState(""); // Estado para la búsqueda

  useEffect(() => {
    fetchZonas();
  }, []);

  const fetchZonas = async () => {
    const data = await getZonas();
    const zonasConContador = await Promise.all(
      data.map(async (zona) => {
        const propiedades = await getPropiedadesPorZona(zona.id);
        return {
          ...zona,
          propiedadesCount: propiedades.length, // Contamos la cantidad de propiedades
        };
      })
    );
    setZonas(zonasConContador);
  };

  const handleAgregarZona = async (e) => {
    e.preventDefault();
    if (nuevaZona.trim() === "") return;
    await createZona(nuevaZona);
    setNuevaZona(""); // Limpiar el campo de la nueva zona
    fetchZonas(); // Recargar zonas con el nuevo conteo de propiedades
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredZonas = zonas.filter((zona) =>
    zona.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Catálogo de Zonas</h2>

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar zona por nombre"
          value={search}
          onChange={handleSearch}
          className="border p-2 rounded w-full"
        />
        {search && (
          <p className="text-sm text-gray-500 mt-1">
            Mostrando {filteredZonas.length} de {zonas.length} zonas
          </p>
        )}
      </div>

      <form onSubmit={handleAgregarZona} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Nombre de nueva zona"
          className="border p-2 rounded w-full"
          value={nuevaZona}
          onChange={(e) => setNuevaZona(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600">
          Agregar
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredZonas.map((zona) => (
          <div key={zona.id} className="p-4 bg-white rounded shadow">
            <h3 className="text-lg font-semibold">
              <Link
                to={`/zona/${zona.id}`}
                className="text-blue-500 hover:underline"
              >
                {zona.nombre}
              </Link>
            </h3>
            <p className="text-gray-500">{zona.propiedadesCount} propiedades</p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Catalogo;
