import { Routes, Route } from "react-router-dom";

// 📄 Páginas
import Login from "./pages/login";
import Index from "./pages/index";
import CrearMaquina from "./pages/CrearMaquina";
import EditarMaquina from "./pages/EditarMaquina";
import MaquinaDetalle from "./pages/MaquinaDetalle";

// 🔐 Protección
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* 🔐 LOGIN */}
      <Route path="/" element={<Login />} />

      {/* 📊 DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />

      {/* ➕ CREAR */}
      <Route
        path="/crear"
        element={
          <ProtectedRoute>
            <CrearMaquina />
          </ProtectedRoute>
        }
      />

      {/* ✏️ EDITAR */}
      <Route
        path="/editar/:id"
        element={
          <ProtectedRoute>
            <EditarMaquina />
          </ProtectedRoute>
        }
      />

      {/* 🔍 DETALLE */}
      <Route
        path="/maquina/:id"
        element={
          <ProtectedRoute>
            <MaquinaDetalle />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;
