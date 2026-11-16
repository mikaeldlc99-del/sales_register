const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistema_de_registro_de_ventas'
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL correctamente');
});

app.get('/api/registros/reporte/:fecha', (req, res) => {
    const { fecha } = req.params;
    const sql = `
        SELECT id, dni, 
               DATE_FORMAT(fecha, '%d/%m/%Y') AS fecha, 
               DATE_FORMAT(hora, '%h:%i %p') AS hora, 
               estado, Observaciones 
        FROM registros 
        WHERE fecha = ? 
        ORDER BY hora ASC
    `;
    db.query(sql, [fecha], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// 1. Listar todos
app.get('/api/registros', (req, res) => {
    const sql = `
        SELECT id, dni, 
               DATE_FORMAT(fecha, '%d/%m/%Y') AS fecha, 
               DATE_FORMAT(hora, '%h:%i %p') AS hora, 
               estado, Observaciones 
        FROM registros 
        ORDER BY id ASC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. Buscar por DNI o ID
app.get('/api/registros/buscar/:termino', (req, res) => {
    const { termino } = req.params;
    const sql = `
        SELECT id, dni, 
               DATE_FORMAT(fecha, '%d/%m/%Y') AS fecha, 
               DATE_FORMAT(hora, '%h:%i %p') AS hora, 
               estado, Observaciones 
        FROM registros 
        WHERE dni LIKE ? OR id = ? 
        ORDER BY id ASC
    `;
    db.query(sql, [`%${termino}%`, termino], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 3. Guardar nuevo registro
app.post('/api/registros', (req, res) => {
    const { dni, estado, Observaciones } = req.body;
    const sql = 'INSERT INTO registros (dni, estado, Observaciones) VALUES (?, ?, ?)';
    db.query(sql, [dni, estado, Observaciones], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Registro guardado', id: result.insertId });
    });
});

// 4. Actualizar registro existente
app.put('/api/registros/:id', (req, res) => {
    const { id } = req.params;
    const { dni, estado, Observaciones } = req.body;
    const sql = 'UPDATE registros SET dni = ?, estado = ?, Observaciones = ? WHERE id = ?';
    db.query(sql, [dni, estado, Observaciones, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Registro actualizado' });
    });
});

// 5. Eliminar registro
app.delete('/api/registros/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM registros WHERE id = ?';
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Registro eliminado' });
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
