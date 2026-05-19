import { Routes, Route } from "react-router-dom";
import { SpeedInsights } from '@vercel/speed-insights/react';

// 📄 Páginas
import Login from "./pages/login";
import Index from "./pages/index";
import CrearMaquina from "./pages/CrearMaquina";
import EditarMaquina from "./pages/EditarMaquina";
import MaquinaDetalle from "./pages/MaquinaDetalle";
import ImportarExcel from "./pages/ImportarExcel";
import Mantenimientos from "./pages/Mantenimientos";
import Repuestos from "./pages/Repuestos";
import HistorialRepuestos from "./pages/HistorialRepuestos";
import Personal from "./pages/Personal";

// 🔐 Protección y Contenedor
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <>
      <Routes>
        {/* 🔐 LOGIN */}
        <Route path="/" element={<Login />} />

        {/* 🛡️ RUTAS PROTEGIDAS CON BARRA LATERAL (SIDEBAR) */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* 📊 DASHBOARD */}
          <Route path="/dashboard" element={<Index />} />

          {/* ➕ CREAR */}
          <Route path="/crear" element={<CrearMaquina />} />

          {/* ✏️ EDITAR */}
          <Route path="/editar/:id" element={<EditarMaquina />} />

          {/* 🔍 DETALLE */}
          <Route path="/maquina/:id" element={<MaquinaDetalle />} />

          {/* 📥 IMPORTAR */}
          <Route path="/importar" element={<ImportarExcel />} />

          {/* 📜 MANTENIMIENTOS */}
          <Route path="/mantenimientos" element={<Mantenimientos />} />
          
          {/* 📦 REPUESTOS */}
          <Route path="/repuestos" element={<Repuestos />} />
          <Route path="/repuestos/historial" element={<HistorialRepuestos />} />

          {/* 👥 PERSONAL (TRABAJADORES) */}
          <Route path="/personal" element={<Personal />} />
        </Route>
      </Routes>
      <SpeedInsights />
    </>
  );
}

export default App;
