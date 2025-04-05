import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Redirigir al login después de cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión: ", error.message);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Bienvenida,</h2>
      <p className="text-gray-700 mb-6">
        Aquí verás tus próximas citas y actividades.
      </p>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Cerrar sesión
      </button>
    </Layout>
  );
};

export default Dashboard;
