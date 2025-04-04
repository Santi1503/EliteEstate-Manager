import Layout from "../components/Layout";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getPropiedadesPorZona,
  createPropiedad,
} from "../firebase/zonasService";
import { uploadImage } from "../firebase/storageService";

const Zona = () => {
  const { zonaId } = useParams();
  const [propiedades, setPropiedades] = useState([]);
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
    const fetchPropiedades = async () => {
      const data = await getPropiedadesPorZona(zonaId);
      setPropiedades(data);
    };

    fetchPropiedades();
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

  const filteredPropiedades = propiedades.filter((propiedad) =>
    propiedad.ubicacion.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Propiedades en esta zona</h2>

      {/* Barra de búsqueda */}
      <input
        type="text"
        placeholder="Buscar propiedad por ubicación"
        value={search}
        onChange={handleSearch}
        className="border p-2 rounded w-full mb-4"
      />

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
              onClick={() => setShowModal(true)} // Mostrar el modal para detalles de propiedad si lo necesitas
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
