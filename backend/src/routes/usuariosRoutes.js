import express from "express";
import { getUsuarios, crearUsuario, editarUsuario, eliminarUsuario } from "../controllers/usuariosController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getUsuarios);
router.post("/", authMiddleware, crearUsuario);
router.put("/:id", authMiddleware, editarUsuario);
router.delete("/:id", authMiddleware, eliminarUsuario);

export default router;