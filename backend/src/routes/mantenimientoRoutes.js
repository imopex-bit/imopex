import express from "express";
import {
  getMantenimientos,
  crearMantenimiento,
  eliminarMantenimiento
} from "../controllers/mantenimientoController.js";


import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📦 LISTAR
router.get("/", authMiddleware, getMantenimientos);

// ➕ CREAR
router.post("/", authMiddleware, crearMantenimiento);


// 🗑️ ELIMINAR
router.delete("/:id", authMiddleware, eliminarMantenimiento);

export default router;