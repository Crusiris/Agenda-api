const express = require('express');
const router = express.Router();
const apoderadosController = require('../controllers/apoderadosController');

// Rutas para Notificación y Recepción (Apoderado)

// POST /api/apoderados/login - Autenticación del apoderado
router.post('/login', apoderadosController.autenticarApoderado);

// GET /api/apoderados/muro - Obtener muro de noticias del apoderado
router.get('/muro', apoderadosController.obtenerMuroNoticias);

// POST /api/apoderados/confirmar-lectura - Confirmar lectura de un reporte
router.post('/confirmar-lectura', apoderadosController.confirmarLectura);

// GET /api/apoderados/hijos - Obtener lista de hijos del apoderado
router.get('/hijos', apoderadosController.obtenerHijos);

// GET /api/apoderados/reportes/:estudianteId - Obtener reportes específicos de un estudiante
router.get('/reportes/:estudianteId', apoderadosController.obtenerReportesEstudiante);

module.exports = router;
