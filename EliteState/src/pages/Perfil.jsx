import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase/config";

const Perfil = () => {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    // Verificar si el correo está verificado
    if (user) {
      setIsEmailVerified(user.emailVerified);
    }
  }, [user]);

  const handleResendVerification = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      setSuccess("Correo de verificación enviado. Por favor, revisa tu bandeja de entrada.");
    } catch (error) {
      setError("Error al enviar el correo de verificación: " + error.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Perfil de Usuario</h2>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Información Personal</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="font-medium">{user?.nombre || "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Apellido</p>
              <p className="font-medium">{user?.apellido || "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Correo Electrónico</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estado de Verificación</p>
              <p className={`font-medium ${isEmailVerified ? "text-green-600" : "text-red-600"}`}>
                {isEmailVerified ? "Verificado" : "No verificado"}
              </p>
            </div>
          </div>
          
          {!isEmailVerified && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Tu correo electrónico no está verificado. Por favor, verifica tu correo para acceder a todas las funcionalidades.
                  </p>
                  <div className="mt-2">
                    <button
                      onClick={handleResendVerification}
                      className="text-sm font-medium text-yellow-700 hover:text-yellow-600"
                    >
                      Reenviar correo de verificación
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
          
          {success && (
            <div className="text-green-500 text-sm mt-2">{success}</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Perfil;
