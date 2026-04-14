import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Index from "./pages/index";
import CrearMaquina from "./pages/CrearMaquina";
import EditarMaquina from "./pages/EditarMaquina";
import ProtectedRoute from "./components/ProtectedRoute";
import MaquinaDetalle from "./pages/MaquinaDetalle";

function App() {
  return (
    <Routes>

      {/* 🔐 LOGIN */}
      <Route path="/" element={<Login />} />

      {/* 📊 Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />

      {/* 🛠️ CRUD */}
      <Route
        path="/crear"
        element={
          <ProtectedRoute>
            <CrearMaquina />
          </ProtectedRoute>
        }
      />

      <Route
        path="/editar/:id"
        element={
          <ProtectedRoute>
            <EditarMaquina />
          </ProtectedRoute>
        }
      />
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