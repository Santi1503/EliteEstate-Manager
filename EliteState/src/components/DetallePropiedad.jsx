import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { uploadImage } from "../firebase/storageService";

const DetallePropiedad = () => {
  const { zonaId, propiedadId } = useParams();
  const [propiedad, setPropiedad] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [propiedadEditada, setPropiedadEditada] = useState(null);

  useEffect(() => {
    const fetchPropiedad = async () => {
      const docRef = doc(db, "zonas", zonaId, "propiedades", propiedadId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPropiedad(docSnap.data());
      }
    };
    fetchPropiedad();
  }, [zonaId, propiedadId]);

  const handleEditar = () => {
    setPropiedadEditada(propiedad);
    setMostrarModal(true);
  };

  const handleActualizarPropiedad = async () => {
    const docRef = doc(db, "zonas", zonaId, "propiedades", propiedadId);
    await updateDoc(docRef, propiedadEditada);
    setPropiedad(propiedadEditada);
    setMostrarModal(false);
  };

  if (!propiedad) return <div>Cargando...</div>;

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Detalles de la Propiedad</h1>

        <div className="bg-white rounded shadow p-4 space-y-2">
          {propiedad.imageUrl && (
            <img
              src={propiedad.imageUrl}
              alt="Propiedad"
              className="w-full max-h-64 object-cover rounded"
            />
          )}
          <p>
            <strong>Dirección:</strong> {propiedad.ubicacion}
          </p>
          <p>
            <strong>Descripción:</strong> {propiedad.descripcion}
          </p>
          <p>
            <strong>Estado:</strong> {propiedad.estado}
          </p>
          <p>
            <strong>Tipo:</strong> {propiedad.tipo}
          </p>
          <p>
            <strong>Precio:</strong> ${propiedad.precio}
          </p>
          <p>
            <strong>Propietario:</strong> {propiedad.propietario}
          </p>
          <p>
            <strong>Metros cuadrados:</strong> {propiedad.metrosCuadrados} m²
          </p>
          <p>
            <strong>Amueblado:</strong> {propiedad.amueblado}
          </p>

          <button
            onClick={handleEditar}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Editar Propiedad
          </button>
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-[90%] max-w-xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Editar Propiedad</h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Dirección"
                value={propiedadEditada.ubicacion}
                onChange={(e) =>
                  setPropiedadEditada({
                    ...propiedadEditada,
                    ubicacion: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              />

              <textarea
                placeholder="Descripción"
                value={propiedadEditada.descripcion}
                onChange={(e) =>
                  setPropiedadEditada({
                    ...propiedadEditada,
                    descripcion: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              />

              <select
                value={propiedadEditada.estado}
                onChange={(e) =>
                  setPropiedadEditada({
                    ...propiedadEditada,
                    estado: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              >
                <option value="">Selecciona estado</option>
                <option value="Disponible">Disponible</option>
                <option value="Ocupado">Ocupado</option>
                <option value="Archivado">Archivado</option>
              </select>

              <select
                value={propiedadEditada.tipo}
                onChange={(e) =>
                  setPropiedadEditada({
                    ...propiedadEditada,
                    tipo: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              >
                <option value="">Selecciona tipo</option>
                <option value="Casa">Casa</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Local">Local</option>
              </select>

              <input
                type="number"
                placeholder="Precio"
                value={propiedadEditada.precio}
                onChange={(e) =>
                  setPropiedadEditada({
                    ...propiedadEditada,
                    precio: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              />

              <input
                type="text"
                placeholder="Propietario"
                value={propiedadEditada.propietario}
                onChange={(e) =>
                  setPropiedadEditada({
                    ...propiedadEditada,
                    propietario: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              />

              <input
                type="number"
                placeholder="Metros cuadrados"
                value={propiedadEditada.metrosCuadrados}
                onChange={(e) =>
                  setPropiedadEditada({
                    ...propiedadEditada,
                    metrosCuadrados: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              />

              <select
                value={propiedadEditada.amueblado}
                onChange={(e) =>
                  setPropiedadEditada({
                    ...propiedadEditada,
                    amueblado: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              >
                <option value="">¿Amueblado?</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>

              {propiedadEditada.imageUrl && (
                <img
                  src={propiedadEditada.imageUrl}
                  alt="Propiedad"
                  className="w-32 h-32 object-cover rounded"
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const imageUrl = await uploadImage(file, "propiedades");
                    setPropiedadEditada({
                      ...propiedadEditada,
                      imageUrl,
                    });
                  }
                }}
                className="border p-2 rounded w-full"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleActualizarPropiedad}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DetallePropiedad;
