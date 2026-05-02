import express from "express";
import { 
  getRepuestos, 
  crearRepuesto, 
  editarRepuesto, 
  eliminarRepuesto, 
  asignarMasivo, 
  getMovimientos,
  revertMovimiento,
  importRepuestos
} from "../controllers/repuestosController.js";

const router = express.Router();

router.get("/", getRepuestos);
router.post("/", crearRepuesto);
router.put("/:id", editarRepuesto);
router.delete("/:id", eliminarRepuesto);

// 🚀 Ruta para procesar múltiples movimientos a la vez
router.post("/masivo", asignarMasivo);

router.get("/movimientos", getMovimientos);
router.delete("/movimientos/:id", revertMovimiento);
router.post("/import", importRepuestos);

export default router;
