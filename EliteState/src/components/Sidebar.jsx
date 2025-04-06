import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold">EliteEstate</h1>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/dashboard"
              className={`block px-4 py-2 rounded ${
                isActive("/dashboard")
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/zonas"
              className={`block px-4 py-2 rounded ${
                isActive("/zonas")
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              Zonas
            </Link>
          </li>
          <li>
            <Link
              to="/propiedades"
              className={`block px-4 py-2 rounded ${
                isActive("/propiedades")
                  ? "bg-gray-900 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              Propiedades
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 rounded flex items-center justify-center"
        >
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 