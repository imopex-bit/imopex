import { Routes, Route } from "react-router-dom";

// 📄 Páginas
import Login from "./pages/login";
import Index from "./pages/index";
import CrearMaquina from "./pages/CrearMaquina";
import EditarMaquina from "./pages/EditarMaquina";
import MaquinaDetalle from "./pages/MaquinaDetalle";
import ImportarExcel from "./pages/ImportarExcel";
import ApiPanel from "./pages/ApiPanel";
import Mantenimientos from "./pages/Mantenimientos";
import Register from "./pages/Register";

// 🔐 Protección
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* 🔐 LOGIN */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />


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

      {/* 📥 IMPORTAR */}
      <Route
        path="/importar"
        element={
          <ProtectedRoute>
            <ImportarExcel />
          </ProtectedRoute>
        }
      />

      {/* 📟 API PANEL */}
      <Route
        path="/api-panel"
        element={
          <ProtectedRoute>
            <ApiPanel />
          </ProtectedRoute>
        }
      />

      {/* 📜 MANTENIMIENTOS */}
      <Route
        path="/mantenimientos"
        element={
          <ProtectedRoute>
            <Mantenimientos />
          </ProtectedRoute>
        }
      />


    </Routes>
  );
}

export default App;
