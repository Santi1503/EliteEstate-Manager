import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Catalogo from "../pages/Catalogo";
import Agenda from "../pages/Agenda";
import Perfil from "../pages/Perfil";
import PrivateRoute from "./PrivateRoute";
import Zona from "../pages/Zonas";
import DetallePropiedad from "../components/DetallePropiedad";
import Register from "../pages/Register";
import RecuperarContrasena from "../pages/RecuperarContrasena";
import Estadisticas from "../pages/Estadisticas";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/catalogo"
        element={
          <PrivateRoute>
            <Catalogo />
          </PrivateRoute>
        }
      />
      <Route
        path="/agenda"
        element={
          <PrivateRoute>
            <Agenda />
          </PrivateRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <Perfil />
          </PrivateRoute>
        }
      />
      <Route
        path="/estadisticas"
        element={
          <PrivateRoute>
            <Estadisticas />
          </PrivateRoute>
        }
      />
      <Route
        path="/zona/:zonaId"
        element={
          <PrivateRoute>
            <Zona />
          </PrivateRoute>
        }
      />
      <Route
        path="/zona/:zonaId/propiedad/:propiedadId"
        element={
          <PrivateRoute>
            <DetallePropiedad />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default Router;
