const express = require('express');
const router = express.Router();
const docentesController = require('../controllers/docentesController');

// Rutas para Gestión del Docente (Emisión)

// POST /api/docentes/login - Autenticación del docente
router.post('/login', docentesController.autenticarDocente);

// GET /api/docentes/perfil - Obtener perfil del docente autenticado
router.get('/perfil', docentesController.obtenerPerfil);

// GET /api/docentes/:id/cursos - Obtener cursos asignados al docente
router.get('/:id/cursos', docentesController.obtenerCursos);

// POST /api/docentes/reportes - Crear reporte (Asistencia, Aviso Diario, Reporte de Salud)
router.post('/reportes', docentesController.crearReporte);

// GET /api/docentes/reportes - Obtener historial de reportes del docente
router.get('/reportes', docentesController.obtenerReportes);

// GET /api/docentes/cursos/:cursoId/estudiantes - Listar estudiantes de un curso
router.get('/cursos/:cursoId/estudiantes', docentesController.obtenerEstudiantesPorCurso);

module.exports = router;
