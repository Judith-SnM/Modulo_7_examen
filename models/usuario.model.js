import { pool } from "../database/connection.js";

const findAll = async () => {
    try {
        const { rows } = await pool.query('SELECT * FROM usuarios');
        return rows;
    } catch (error) {
        console.error('Error al obtener todos los usuarios:', error);
        throw new Error('Error al obtener todos los usuarios');
    }
};

const create = async (nombre, balance) => {
    try {
        if (!nombre || balance === undefined) {
            throw new Error('Nombre y balance son requeridos');
        }
        const query = {
            text: `INSERT INTO USUARIOS (nombre, balance) VALUES ($1, $2) RETURNING *`,
            values: [nombre, balance]
        };
        const { rows } = await pool.query(query);
        return rows[0];
    } catch (error) {
        console.error('Error al crear usuario:', error);
        throw new Error('Error al crear usuario');
    }
};

const remove = async (id) => {
    try {
        const query = {
            text: `DELETE FROM USUARIOS WHERE id = $1 RETURNING *`,
            values: [id]
        };
        const { rows } = await pool.query(query);
        if (rows.length === 0) {
            throw new Error('Usuario no encontrado');
        }
        return rows[0];
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        throw new Error('Error al eliminar usuario');
    }
};

const update = async (id, { nombre, balance }) => {
    try {
        if (!nombre || balance === undefined) {
            throw new Error('Nombre y balance son requeridos');
        }
        const query = {
            text: `UPDATE USUARIOS SET nombre = $1, balance = $2 WHERE id = $3 RETURNING *`,
            values: [nombre, balance, id]
        };
        const { rows } = await pool.query(query);
        if (rows.length === 0) {
            throw new Error('Usuario no encontrado');
        }
        return rows[0];
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw new Error('Error al actualizar usuario');
    }
};

export const usuarioModel = {
    findAll,
    create,
    remove,
    update
};
