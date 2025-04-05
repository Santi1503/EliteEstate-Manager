import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext"; // Asegúrate de importar el hook

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/catalogo", label: "Catálogo" },
  { path: "/agenda", label: "Agenda" },
  { path: "/perfil", label: "Perfil" },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth(); // Ahora puedes usar el hook

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
        <h1 className="text-2xl font-bold mb-6 text-blue-600">Inmuebles</h1>
        <nav className="flex flex-col gap-4">
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
