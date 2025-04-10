import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { updatePropiedad, getPropiedadesPorZona } from "../firebase/zonasService";
import PropiedadPDF from "./PropiedadPDF";
import heic2any from 'heic2any';

const DetallePropiedad = () => {
  const { zonaId, propiedadId } = useParams();
  const navigate = useNavigate();
  const [propiedad, setPropiedad] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPropiedad, setEditedPropiedad] = useState(null);
  const [search, setSearch] = useState("");
  const [propiedades, setPropiedades] = useState([]);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [extraImages, setExtraImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const convertHeicToJpeg = async (file) => {
    try {
      // Verificar si es un archivo HEIC
      if (file.type === 'image/heic' || file.type === 'image/heif' || 
          file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        // Convertir HEIC a JPEG
        const blob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8
        });
        
        // Crear un nuevo archivo con el mismo nombre pero extensión .jpg
        const fileName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
        return new File([blob], fileName, { type: 'image/jpeg' });
      }
      return file; // Si no es HEIC, devolver el archivo original
    } catch (error) {
      console.error("Error al convertir HEIC a JPEG:", error);
      return file; // En caso de error, devolver el archivo original
    }
  };

  const handleImageUpload = async (e) => {
    setIsProcessing(true);
    try {
      const files = Array.from(e.target.files);
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic', 'image/heif'];
      
      const isValid = files.every(file => 
        allowedTypes.includes(file.type) || 
        file.name.toLowerCase().endsWith('.heic') || 
        file.name.toLowerCase().endsWith('.heif')
      );
      
      if (!isValid) {
        alert("Por favor, sube solo imágenes válidas (JPEG, PNG, WebP, JPG, HEIC, HEIF)");
        return;
      }
      
      // Convertir archivos HEIC a JPEG
      const convertedFiles = await Promise.all(files.map(convertHeicToJpeg));
      
      const imagePromises = convertedFiles.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });
      
      const base64Images = await Promise.all(imagePromises);
      setExtraImages(base64Images);
    } catch (error) {
      console.error("Error al procesar las imágenes:", error);
      alert("Hubo un error al procesar las imágenes. Por favor, intenta de nuevo.");
    } finally {
      setIsProcessing(false);
    }
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

          {!isEditing && (
            <button
            onClick={() => setShowPDFModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
           >
             Descargar PDF
           </button>
          )}
          
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

      {showPDFModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded p-6 w-full max-w-md shadow-lg">
      <h2 className="text-lg font-bold mb-4">Subir imágenes</h2>

      <input
        type="file"
        multiple
        accept="image/png image/jpeg image/jpg image/webp image/heic image/heif"
        onChange={handleImageUpload}
        className="mb-4 bg-gray-200 p-2 rounded-xl border border-gray-300"
        disabled={isProcessing}
      />

      {isProcessing && (
        <div className="text-center mb-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-2 text-sm text-gray-600">Procesando imágenes...</p>
        </div>
      )}

      {extraImages.length > 0 && (
        <div className="flex overflow-x-auto gap-4 mb-4 p-1">
          {extraImages.map((img, idx) => (
            <div key={idx} className="flex-shrink-0 w-60">
              <img
                src={img}
                alt={`extra-${idx}`}
                className="w-full aspect-video object-contain bg-gray-100 rounded"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setShowPDFModal(false)
            setExtraImages([])
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            PropiedadPDF(propiedad, extraImages);
            setShowPDFModal(false);
            setExtraImages([]);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Generar PDF
        </button>
      </div>
    </div>
  </div>
)}
    </Layout>
  );
};

export default DetallePropiedad;
