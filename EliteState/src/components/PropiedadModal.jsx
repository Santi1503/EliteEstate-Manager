import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPropiedadPorId } from "../firebase/zonasService";
import { updatePropiedad, archivePropiedad } from "../firebase/zonasService";

const PropiedadModal = ({ setShowModal }) => {
  const { zonaId, propiedadId } = useParams();
  const [propiedad, setPropiedad] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ubicacion: "",
    descripcion: "",
    precio: "",
    propietario: "",
    metrosCuadrados: "",
    amueblado: "",
    imageUrl: "",
  });

  useEffect(() => {
    const fetchPropiedad = async () => {
      const data = await getPropiedadPorId(zonaId, propiedadId);
      setPropiedad(data);
      setFormData(data);
    };

    fetchPropiedad();
  }, [zonaId, propiedadId]);

  const handleEditClick = () => setIsEditing(true);

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData(propiedad);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await updatePropiedad(zonaId, propiedadId, formData);
    setIsEditing(false);
  };

  const handleArchive = async () => {
    await archivePropiedad(zonaId, propiedadId);
    setShowModal(false); // Cerrar el modal después de archivar
  };

  if (!propiedad) return <div>Loading...</div>;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Detalles de la propiedad</h2>

        <form>
          <label>Ubicación:</label>
          <input
            type="text"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <label>Descripción:</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <label>Precio:</label>
          <input
            type="text"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <label>Propietario:</label>
          <input
            type="text"
            name="propietario"
            value={formData.propietario}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <label>Metros Cuadrados:</label>
          <input
            type="text"
            name="metrosCuadrados"
            value={formData.metrosCuadrados}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <label>Amueblado:</label>
          <input
            type="text"
            name="amueblado"
            value={formData.amueblado}
            onChange={handleChange}
            disabled={!isEditing}
          />

          <button
            type="button"
            onClick={isEditing ? handleSave : handleEditClick}
          >
            {isEditing ? "Guardar Cambios" : "Editar"}
          </button>
          <button type="button" onClick={handleCancelClick}>
            Cancelar
          </button>
          <button type="button" onClick={handleArchive}>
            Archivar Propiedad
          </button>
        </form>
        <button onClick={() => setShowModal(false)}>Cerrar</button>
      </div>
    </div>
  );
};

export default PropiedadModal;
