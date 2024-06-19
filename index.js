import 'dotenv/config';
import express from 'express';
import pkg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/usuario', async (req, res) => {
  const { nombre, balance } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *',
      [nombre, balance]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    res.status(500).send(`Error interno del servidor: ${error.message}`);
  }
});

app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send(`Error interno del servidor: ${error.message}`);
  }
});

app.put('/usuario/:id', async (req, res) => {  
  const { id } = req.params; 
  const { nombre, balance } = req.body;
  try {
    const result = await pool.query(
      'UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3 RETURNING *',
      [nombre, balance, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).send(`Error interno del servidor: ${error.message}`);
  }
});

app.delete('/usuario/:id', async (req, res) => { 
  const { id } = req.params; 
  try {
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING *',
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).send(`Error interno del servidor: ${error.message}`);
  }
});

app.post('/transferencia', async (req, res) => {
  const { emisor, receptor, monto } = req.body;
  try {
    await pool.query('BEGIN');

    const emisorResult = await pool.query(
      'UPDATE usuarios SET balance = balance - $1 WHERE id = $2 RETURNING *',
      [monto, emisor]
    );

    if (emisorResult.rowCount === 0) {
      throw new Error('Emisor no encontrado');
    }

    const receptorResult = await pool.query(
      'UPDATE usuarios SET balance = balance + $1 WHERE id = $2 RETURNING *',
      [monto, receptor]
    );

    if (receptorResult.rowCount === 0) {
      throw new Error('Receptor no encontrado');
    }

    const transferenciaResult = await pool.query(
      'INSERT INTO transferencias (emisor, receptor, monto) VALUES ($1, $2, $3) RETURNING *',
      [emisor, receptor, monto]
    );

    await pool.query('COMMIT');
    res.status(201).json(transferenciaResult.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al realizar transferencia:', error);
    res.status(500).send(`Error interno del servidor: ${error.message}`);
  }
});

app.get('/transferencias', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transferencias');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener transferencias:', error);
    res.status(500).send(`Error interno del servidor: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
