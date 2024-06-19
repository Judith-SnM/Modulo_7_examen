import { pool } from "../database/connection.js";

const createTransferencia = async ({ emisor, receptor, monto }) => {
    try {
        await pool.query("BEGIN");

        const emisorQuery = {
            text: `SELECT id FROM usuarios WHERE nombre = $1`,
            values: [emisor]
        };
        const receptorQuery = {
            text: `SELECT id FROM usuarios WHERE nombre = $1`,
            values: [receptor]
        };

        const [emisorResult, receptorResult] = await Promise.all([
            pool.query(emisorQuery),
            pool.query(receptorQuery)
        ]);

        if (emisorResult.rows.length === 0) {
            throw new Error("Emisor no encontrado");
        }
        if (receptorResult.rows.length === 0) {
            throw new Error("Receptor no encontrado");
        }

        const emisorId = emisorResult.rows[0].id;
        const receptorId = receptorResult.rows[0].id;

        const saldoEmisorQuery = {
            text: `SELECT balance FROM usuarios WHERE id = $1`,
            values: [emisorId]
        };
        const saldoEmisorResult = await pool.query(saldoEmisorQuery);
        const saldoEmisor = saldoEmisorResult.rows[0].balance;

        const montoNumerico = parseFloat(monto);
        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            throw new Error("El monto de la transferencia debe ser un número válido mayor que cero");
        }

        if (saldoEmisor < montoNumerico) {
            throw new Error("Saldo insuficiente para realizar la transferencia");
        }

        const updateBalanceEmisorQuery = {
            text: `UPDATE usuarios SET balance = balance - $1 WHERE id = $2`,
            values: [montoNumerico, emisorId]
        };

        const updateEmisorResult = await pool.query(updateBalanceEmisorQuery);
        console.log('Update Emisor Result:', updateEmisorResult.rowCount);
        if (updateEmisorResult.rowCount === 0) {
            throw new Error("Error al actualizar el saldo del emisor");
        }

        const updateBalanceReceptorQuery = {
            text: `UPDATE usuarios SET balance = balance + $1 WHERE id = $2`,
            values: [montoNumerico, receptorId]
        };

        const updateReceptorResult = await pool.query(updateBalanceReceptorQuery);
        console.log('Update Receptor Result:', updateReceptorResult.rowCount);
        if (updateReceptorResult.rowCount === 0) {
            throw new Error("Error al actualizar el saldo del receptor");
        }

        const transferQuery = {
            text: "INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *",
            values: [emisorId, receptorId, montoNumerico]
        };

        const { rows } = await pool.query(transferQuery);

        await pool.query("COMMIT");
        return {
            ok: true,
            data: rows[0]
        };
    } catch (error) {
        console.error('Error en la transferencia:', error);
        await pool.query("ROLLBACK");
        return {
            ok: false,
            data: "Error en la transferencia"
        };
    }
};

const obtenerTransferencias = async () => {
    try {
        const query = 'SELECT * FROM transferencias';
        const { rows } = await pool.query(query);
        return rows;
    } catch (error) {
        console.error('Error al obtener las transferencias desde el modelo:', error);
        throw new Error('Error al obtener las transferencias desde el modelo');
    }
};

export const transferenciaModel = {
    createTransferencia,
    obtenerTransferencias
};