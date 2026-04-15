import express from "express";
import {
  getMaquinas,
  getMaquinaDetalle,
  crearMaquina,
  editarMaquina,
  eliminarMaquina
} from "../controllers/maquinasController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📦 LISTAR
router.get("/", authMiddleware, getMaquinas);

// 🔍 DETALLE
router.get("/:id", authMiddleware, getMaquinaDetalle);

// ➕ CREAR
router.post("/", authMiddleware, crearMaquina);

// ✏️ EDITAR
router.put("/:id", authMiddleware, editarMaquina);

// 🗑️ ELIMINAR
router.delete("/:id", authMiddleware, eliminarMaquina);

export default router;