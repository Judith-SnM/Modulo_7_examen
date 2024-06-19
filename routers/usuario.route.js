import { Router } from "express";
import { createUser, deleteUser, getAllUsers, updateUser } from "../controller/usuario.controller.js";

const router = Router()

router.get('/usuarios', getAllUsers)
router.post('/usuario', createUser)
router.delete('/usuario/:id', deleteUser)
router.put('/usuario/:id', updateUser)

export default router;
