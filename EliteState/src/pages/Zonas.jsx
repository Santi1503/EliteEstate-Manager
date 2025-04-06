import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getPropiedadesPorZona,
  createPropiedad,
  getZonaById,
} from "../firebase/zonasService";
import { uploadImage } from "../firebase/storageService";

const Zona = () => {
  const { zonaId } = useParams();
  const navigate = useNavigate();
  const [propiedades, setPropiedades] = useState([]);
  const [zona, setZona] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nuevaPropiedad, setNuevaPropiedad] = useState({
    ubicacion: "",
    descripcion: "",
    estado: "", // Renta/Venta
    tipo: "", // Apartamento/Lote/Local/Casa
    precio: "",
    moneda: "$", // Moneda (por defecto $)
    propietario: "",
    metrosCuadrados: "",
    amueblado: "",
    imageUrl: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState(""); // Estado para la búsqueda

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [zonaData, propiedadesData] = await Promise.all([
          getZonaById(zonaId),
          getPropiedadesPorZona(zonaId)
        ]);
        setZona(zonaData);
        setPropiedades(propiedadesData);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [zonaId]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = await uploadImage(file, "propiedades");
      setNuevaPropiedad({ ...nuevaPropiedad, imageUrl: imageUrl });
    }
  };

  const handleAgregarPropiedad = async (e) => {
    e.preventDefault();
    await createPropiedad(zonaId, nuevaPropiedad);
    setNuevaPropiedad({
      ubicacion: "",
      descripcion: "",
      estado: "",
      tipo: "",
      precio: "",
      moneda: "$",
      propietario: "",
      metrosCuadrados: "",
      amueblado: "",
      imageUrl: "",
    });
    const data = await getPropiedadesPorZona(zonaId);
    setPropiedades(data);
    setShowModal(false); // Cerrar el modal después de agregar la propiedad
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const filteredPropiedades = propiedades.filter((propiedad) => {
    const searchTerm = search.toLowerCase();
    return (
      propiedad.ubicacion.toLowerCase().includes(searchTerm) ||
      propiedad.descripcion.toLowerCase().includes(searchTerm) ||
      propiedad.tipo.toLowerCase().includes(searchTerm) ||
      propiedad.estado.toLowerCase().includes(searchTerm) ||
      propiedad.propietario.toLowerCase().includes(searchTerm)
    );
  });

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Propiedades en {zona?.nombre}</h2>
        <button
          onClick={() => navigate('/catalogo')}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 flex items-center"
        >
          <span className="mr-1">←</span> Volver a Zonas
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar propiedad por ubicación, descripción, tipo, estado o propietario"
          value={search}
          onChange={handleSearch}
          className="border p-2 rounded w-full"
        />
        {search && (
          <p className="text-sm text-gray-500 mt-1">
            Mostrando {filteredPropiedades.length} de {propiedades.length} propiedades
          </p>
        )}
      </div>

      {/* Botón para agregar propiedad */}
      <button
        onClick={() => setShowModal(true)} // Mostrar el modal
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4"
      >
        Agregar propiedad
      </button>

      {/* Modal para agregar propiedad */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Agregar Propiedad</h3>

            <form
              onSubmit={handleAgregarPropiedad}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                placeholder="Ubicación"
                value={nuevaPropiedad.ubicacion}
                onChange={(e) =>
                  setNuevaPropiedad({
                    ...nuevaPropiedad,
                    ubicacion: e.target.value,
                  })
                }
                className="border p-2 rounded"
              />
              <textarea
                placeholder="Descripción"
                value={nuevaPropiedad.descripcion}
                onChange={(e) =>
                  setNuevaPropiedad({
                    ...nuevaPropiedad,
                    descripcion: e.target.value,
                  })
                }
                className="border p-2 rounded"
              />

              {/* Select para Estado (Renta/Venta) */}
              <select
                value={nuevaPropiedad.estado}
                onChange={(e) =>
                  setNuevaPropiedad({
                    ...nuevaPropiedad,
                    estado: e.target.value,
                  })
                }
                className="border p-2 rounded"
              >
                <option value="">Estado</option>
                <option value="Renta">Renta</option>
                <option value="Venta">Venta</option>
              </select>

              {/* Select para Tipo (Apartamento/Lote/Local/Casa) */}
              <select
                value={nuevaPropiedad.tipo}
                onChange={(e) =>
                  setNuevaPropiedad({ ...nuevaPropiedad, tipo: e.target.value })
                }
                className="border p-2 rounded"
              >
                <option value="">Tipo</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Lote">Lote</option>
                <option value="Local">Local</option>
                <option value="Casa">Casa</option>
              </select>

              {/* Select para Moneda (USD/Quetzales) */}
              <span className="g-4">
                <select
                  value={nuevaPropiedad.moneda}
                  onChange={(e) =>
                    setNuevaPropiedad({
                      ...nuevaPropiedad,
                      moneda: e.target.value,
                    })
                  }
                  className="border p-2 rounded"
                >
                  <option value="$">$</option>
                  <option value="Q">Q</option>
                </select>
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={nuevaPropiedad.precio}
                  onChange={(e) =>
                    setNuevaPropiedad({
                      ...nuevaPropiedad,
                      precio: e.target.value,
                    })
                  }
                  className="border p-2 rounded"
                />
              </span>

              <input
                type="text"
                placeholder="Propietario"
                value={nuevaPropiedad.propietario}
                onChange={(e) =>
                  setNuevaPropiedad({
                    ...nuevaPropiedad,
                    propietario: e.target.value,
                  })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Metros Cuadrados"
                value={nuevaPropiedad.metrosCuadrados}
                onChange={(e) =>
                  setNuevaPropiedad({
                    ...nuevaPropiedad,
                    metrosCuadrados: e.target.value,
                  })
                }
                className="border p-2 rounded"
              />
              <select
                value={nuevaPropiedad.amueblado}
                onChange={(e) =>
                  setNuevaPropiedad({
                    ...nuevaPropiedad,
                    amueblado: e.target.value,
                  })
                }
                className="border p-2 rounded"
              >
                <option value="">Amueblado</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="border p-2 rounded"
              />
              {nuevaPropiedad.imageUrl && (
                <img
                  src={nuevaPropiedad.imageUrl}
                  alt="Imagen de propiedad"
                  className="w-32 h-32 object-cover mt-2"
                />
              )}

              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Agregar Propiedad
              </button>
            </form>

            <button
              onClick={() => setShowModal(false)} // Cerrar el modal
              className="bg-red-500 text-white px-4 py-2 rounded mt-4 hover:bg-red-600"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de propiedades filtradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPropiedades.map((propiedad) => (
          <div key={propiedad.id} className="p-4 bg-white rounded shadow">
            <h3 className="text-lg font-semibold">{propiedad.ubicacion}</h3>
            <p>{propiedad.descripcion}</p>
            <p>
              {propiedad.moneda} {propiedad.precio}
            </p>

            <button
              onClick={() => navigate(`/zona/${zonaId}/propiedad/${propiedad.id}`)}
              className="text-blue-500 hover:underline mt-2 inline-block"
            >
              Ver detalles
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Zona;
