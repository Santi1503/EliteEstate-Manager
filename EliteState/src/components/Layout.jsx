import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { getAuth, signOut } from "firebase/auth";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/catalogo", label: "Catálogo" },
  { path: "/agenda", label: "Agenda" },
  { path: "/estadisticas", label: "Estadísticas" },
  { path: "/perfil", label: "Perfil" },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      // Forzar recarga de la página para redirigir al login
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md p-6 hidden md:block flex flex-col">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">Inmuebles</h1>
        <nav className="flex flex-col gap-4 flex-grow">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-md hover:bg-blue-100 transition ${
                location.pathname === item.path
                  ? "bg-blue-500 text-white"
                  : "text-gray-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
