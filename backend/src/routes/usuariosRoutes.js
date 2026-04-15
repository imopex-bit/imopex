import express from "express";
import { getUsuarios } from "../controllers/usuariosController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📋 LISTAR USUARIOS
router.get("/", authMiddleware, getUsuarios);

export default router;