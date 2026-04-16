import express from "express";
import cors from "cors";

// 📦 Importar rutas
import authRoutes from "./routes/authRoutes.js";
import maquinasRoutes from "./routes/maquinasRoutes.js";
import mantenimientoRoutes from "./routes/mantenimientoRoutes.js";
import usuariosRoutes from "./routes/usuariosRoutes.js";

const app = express();

// 🔥 CORS (PRODUCCIÓN + DESARROLLO)
const allowedOrigins = [
  "https://imopex.vercel.app" 
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite herramientas como Postman o requests sin origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("❌ Bloqueado por CORS"));
  },
  credentials: true
}));

// 📥 JSON middleware
app.use(express.json());

// 🧠 IMPORTANTE (recomendado para login con proxies como Render)
app.set("trust proxy", 1);

// 🧪 Ruta base para probar backend
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
