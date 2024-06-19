import { Router } from "express";
import { obtenerTransferencias, transferenciaController } from "../controller/transferencia.controller.js";

const router = Router()

router.post('/transferencia', transferenciaController)
router.get('/transferencias', obtenerTransferencias)

export default router
