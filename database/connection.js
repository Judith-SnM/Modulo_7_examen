import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.CONNECTION_STRING;

if (!connectionString) {
    console.error('La cadena de conexión no está definida en el archivo .env');
    process.exit(1);
}

export const pool = new Pool({
    connectionString,
    allowExitOnIdle: true,
});

(async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Conexión a PostgreSQL establecida:', res.rows[0].now);
    } catch (error) {
        console.error('Error al conectar con PostgreSQL:', error.message);
        process.exit(1);
    }
})();
