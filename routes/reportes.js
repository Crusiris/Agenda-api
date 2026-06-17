const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

// Rutas para Gestión de Reportes Escolares

// GET /api/reportes/tipos - Obtener tipos de reportes disponibles
router.get('/tipos', reportesController.obtenerTiposReportes);

// POST /api/reportes/asistencia - Crear reporte de asistencia
router.post('/asistencia', reportesController.crearReporteAsistencia);

// POST /api/reportes/aviso-diario - Crear aviso diario
router.post('/aviso-diario', reportesController.crearAvisoDiario);

// POST /api/reportes/salud - Crear reporte de salud
router.post('/salud', reportesController.crearReporteSalud);

// GET /api/reportes/curso/:cursoId - Obtener reportes por curso
router.get('/curso/:cursoId', reportesController.obtenerReportesPorCurso);

// GET /api/reportes/estadisticas - Obtener estadísticas de confirmaciones de lectura
router.get('/estadisticas', reportesController.obtenerEstadisticas);

module.exports = router;
