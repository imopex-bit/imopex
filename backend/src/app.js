import express from "express";
import cors from "cors";

// 📦 Importar rutas
import authRoutes from "./routes/authRoutes.js";
import maquinasRoutes from "./routes/maquinasRoutes.js";
import mantenimientoRoutes from "./routes/mantenimientoRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";

const app = express();

// 🔓 CORS
app.use(cors({ origin: true }));

// 📥 JSON
app.use(express.json());

// 🧪 Ruta base
app.get("/api", (req, res) => {
  res.send("API FUNCIONANDO 🔥");
});

// 🔐 AUTH
app.use("/api/auth", authRoutes);

// 🖥️ MÁQUINAS
app.use("/api/maquinas", maquinasRoutes);

// 🛠️ MANTENIMIENTO
app.use("/api/mantenimiento", mantenimientoRoutes);

// 👤 USUARIOS
app.use("/api/usuarios", usuariosRoutes);

export default app;
