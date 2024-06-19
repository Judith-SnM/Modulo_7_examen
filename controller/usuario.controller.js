import { usuarioModel } from "../models/usuario.model.js";

function validateUserData(nombre, balance) {
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        throw new Error('El nombre del usuario es requerido y debe ser una cadena de caracteres no vacía.');
    }
    if (balance === undefined || typeof balance !== 'number' || isNaN(balance)) {
        throw new Error('El balance del usuario es requerido y debe ser un número.');
    }
}

export const createUser = async (req, res) => {
    try {
        const { nombre, balance } = req.body;
        validateUserData(nombre, balance);
        const newUser = await usuarioModel.create({ nombre, balance });
        res.status(201).json({ newUser });
    } catch (error) {
        console.error('Error al crear usuario:', error.message);
        res.status(400).json({ ok: false, message: error.message });
    }
}

export const getAllUsers = async (req, res) => {
    try {
        const usuarios = await usuarioModel.findAll();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ ok: false, message: 'Error al obtener usuarios' });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, balance } = req.body;
        validateUserData(nombre, balance);
        const usuario = await usuarioModel.update(id, { nombre, balance });
        if (!usuario) {
            return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario);
    } catch (error) {
        console.error('Error al actualizar usuario:', error.message);
        res.status(400).json({ ok: false, message: error.message });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await usuarioModel.remove(id);
        if (!user) {
            return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
        }
        res.status(200).json({ ok: true, message: 'Usuario eliminado' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ ok: false, message: 'Error al eliminar usuario' });
    }
}
