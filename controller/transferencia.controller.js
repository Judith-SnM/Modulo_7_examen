import { transferenciaModel } from "../models/transferencia.model.js";

function cleanValue(value) {
    if (typeof value !== 'string') {
        throw new TypeError('Se esperaba una cadena de caracteres');
    }
    return value.replace(/(^'|'$)/g, '');
}

export const transferenciaController = async (req, res) => {
    try {
        const { emisor, receptor, monto } = req.body;

        if (!emisor || !receptor || monto === undefined) {
            return res.status(400).json({ ok: false, message: 'Emisor, receptor y monto son requeridos' });
        }

        const cleanedEmisor = cleanValue(emisor);
        const cleanedReceptor = cleanValue(receptor);
        const cleanedMonto = cleanValue(monto);

        const result = await transferenciaModel.createTransferencia({
            emisor: cleanedEmisor,
            receptor: cleanedReceptor,
            monto: cleanedMonto
        });
        res.status(201).json(result);
    } catch (error) {
        console.error('Error al crear la transferencia:', error);
        res.status(500).json({ ok: false, message: "Error al crear transferencia" });
    }
};

export const obtenerTransferencias = async (req, res) => {
    try {
        const transferencias = await transferenciaModel.obtenerTransferencias();
        res.status(200).json(transferencias);
    } catch (error) {
        console.error('Error al obtener las transferencias:', error);
        res.status(500).json({ ok: false, message: 'Error al obtener transferencias' });
    }
};
