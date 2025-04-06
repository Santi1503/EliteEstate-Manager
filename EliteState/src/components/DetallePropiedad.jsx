import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { updatePropiedad, getPropiedadesPorZona } from "../firebase/zonasService";

const DetallePropiedad = () => {
  const { zonaId, propiedadId } = useParams();
  const navigate = useNavigate();
  const [propiedad, setPropiedad] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPropiedad, setEditedPropiedad] = useState(null);
  const [search, setSearch] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const fetchPropiedad = async () => {
      const docRef = doc(db, "zonas", zonaId, "propiedades", propiedadId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const propiedadData = { id: docSnap.id, ...docSnap.data() };
        setPropiedad(propiedadData);
        setEditedPropiedad(propiedadData);
      }
    };
    fetchPropiedad();
  }, [zonaId, propiedadId]);

  useEffect(() => {
    const fetchPropiedades = async () => {
      const data = await getPropiedadesPorZona(zonaId);
      setPropiedades(data);
    };
    fetchPropiedades();
  }, [zonaId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPropiedad({
      ...editedPropiedad,
      [name]: value
    });
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setShowSearchResults(true);
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

  const handleSave = async () => {
    try {
      await updatePropiedad(zonaId, propiedadId, editedPropiedad);
      setPropiedad(editedPropiedad);
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar la propiedad:", error);
    }
  };

  const handleCancel = () => {
    setEditedPropiedad(propiedad);
    setIsEditing(false);
  };

  const handleSelectPropiedad = (id) => {
    navigate(`/zona/${zonaId}/propiedad/${id}`);
    setShowSearchResults(false);
    setSearch("");
  };

  if (!propiedad) return <div>Cargando...</div>;

  return (
    <Layout>
      <div className="p-4">
        <div className="flex justify-between mb-4">
          <button
            onClick={() => navigate(`/zona/${zonaId}`)}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            ← Atrás
          </button>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Editar Propiedad
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Guardar
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Detalles de la Propiedad</h1>

        {/* Barra de búsqueda para otras propiedades */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Buscar otras propiedades en esta zona"
            value={search}
            onChange={handleSearch}
            className="border p-2 rounded w-full"
          />
          {showSearchResults && search && (
            <div className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
              {filteredPropiedades.length > 0 ? (
                filteredPropiedades.map((prop) => (
                  <div 
                    key={prop.id} 
                    className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                    onClick={() => handleSelectPropiedad(prop.id)}
                  >
                    <p className="font-medium">{prop.ubicacion}</p>
                    <p className="text-sm text-gray-600">{prop.tipo} - {prop.estado}</p>
                  </div>
                ))
              ) : (
                <div className="p-2 text-gray-500">No se encontraron propiedades</div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded shadow p-4 space-y-4">
          {propiedad.imageUrl && (
            <img
              src={propiedad.imageUrl}
              alt="Propiedad"
              className="w-full max-h-64 object-cover rounded"
            />
          )}
          
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input
                  type="text"
                  name="ubicacion"
                  value={editedPropiedad.ubicacion}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  name="descripcion"
                  value={editedPropiedad.descripcion}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <select
                  name="estado"
                  value={editedPropiedad.estado}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Seleccionar estado</option>
                  <option value="Renta">Renta</option>
                  <option value="Venta">Venta</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  name="tipo"
                  value={editedPropiedad.tipo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Lote">Lote</option>
                  <option value="Local">Local</option>
                  <option value="Casa">Casa</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <div className="flex">
                  <select
                    name="moneda"
                    value={editedPropiedad.moneda}
                    onChange={handleInputChange}
                    className="mt-1 block w-20 border border-gray-300 rounded-md shadow-sm p-2"
                  >
                    <option value="$">$</option>
                    <option value="Q">Q</option>
                  </select>
                  <input
                    type="number"
                    name="precio"
                    value={editedPropiedad.precio}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ml-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Propietario</label>
                <input
                  type="text"
                  name="propietario"
                  value={editedPropiedad.propietario}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Metros cuadrados</label>
                <input
                  type="text"
                  name="metrosCuadrados"
                  value={editedPropiedad.metrosCuadrados}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Amueblado</label>
                <select
                  name="amueblado"
                  value={editedPropiedad.amueblado}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Seleccionar</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
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
                <strong>Precio:</strong> {propiedad.moneda} {propiedad.precio}
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
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DetallePropiedad;
