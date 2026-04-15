import express from "express";
import {
  crearMantenimiento,
  eliminarMantenimiento
} from "../controllers/mantenimientoController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ➕ CREAR
router.post("/", authMiddleware, crearMantenimiento);

// 🗑️ ELIMINAR
router.delete("/:id", authMiddleware, eliminarMantenimiento);

export default router;