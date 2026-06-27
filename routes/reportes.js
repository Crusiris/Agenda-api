const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Gestión de reportes escolares — asistencia, avisos diarios y salud
 */

/**
 * @swagger
 * /api/reportes/tipos:
 *   get:
 *     tags: [Reportes]
 *     summary: Obtener tipos de reportes disponibles
 *     description: Retorna la lista estática de tipos de reportes configurados en el sistema, con sus campos requeridos.
 *     responses:
 *       200:
 *         description: Tipos de reportes
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TipoReporte'
 */
router.get('/tipos', reportesController.obtenerTiposReportes);
router.get('/:id', reportesController.obtenerReportePorId);

/**
 * @swagger
 * /api/reportes/asistencia:
 *   post:
 *     tags: [Reportes]
 *     summary: Crear reporte de asistencia
 *     description: Crea un reporte de asistencia para un curso en una fecha determinada. Incluye el detalle de cada estudiante (presente, ausente, atrasado, justificado). Requiere el header `x-docente-id`.
 *     parameters:
 *       - $ref: '#/components/parameters/DocenteIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearAsistenciaRequest'
 *           example:
 *             cursoId: 1
 *             fecha: '2026-06-16'
 *             estudiantes:
 *               - estudianteId: 5
 *                 nombre: Valentina Pérez
 *                 estado: presente
 *               - estudianteId: 6
 *                 nombre: Diego Soto
 *                 estado: ausente
 *     responses:
 *       201:
 *         description: Reporte de asistencia creado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/ReporteEscolar'
 *       400:
 *         description: Campos requeridos faltantes o error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
router.post('/asistencia', reportesController.crearReporteAsistencia);

/**
 * @swagger
 * /api/reportes/aviso-diario:
 *   post:
 *     tags: [Reportes]
 *     summary: Crear aviso diario
 *     description: Crea un aviso diario visible para los apoderados del curso. Requiere el header `x-docente-id`.
 *     parameters:
 *       - $ref: '#/components/parameters/DocenteIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearAvisoDiarioRequest'
 *           example:
 *             cursoId: 1
 *             titulo: Reunión de apoderados
 *             contenido: La reunión es el viernes 20 de junio a las 18:00 hrs en la sala 3B.
 *     responses:
 *       201:
 *         description: Aviso diario creado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/ReporteEscolar'
 *       400:
 *         description: Campos requeridos faltantes o error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
router.post('/aviso-diario', reportesController.crearAvisoDiario);

/**
 * @swagger
 * /api/reportes/salud:
 *   post:
 *     tags: [Reportes]
 *     summary: Crear reporte de salud
 *     description: Crea un reporte de salud para un estudiante específico. Notifica al apoderado inmediatamente. Requiere el header `x-docente-id`.
 *     parameters:
 *       - $ref: '#/components/parameters/DocenteIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearSaludRequest'
 *           example:
 *             cursoId: 1
 *             estudianteId: 5
 *             titulo: Reporte de Salud - Valentina Pérez
 *             sintomas:
 *               - fiebre 38°C
 *               - dolor de cabeza
 *             acciones:
 *               - Se llamó al apoderado
 *               - Se administró paracetamol
 *             requiereAtencion: true
 *     responses:
 *       201:
 *         description: Reporte de salud creado y apoderado notificado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/ReporteEscolar'
 *                     notificacion:
 *                       type: string
 *                       example: Apoderado notificado inmediatamente
 *       400:
 *         description: Campos requeridos faltantes o error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
router.post('/salud', reportesController.crearReporteSalud);

/**
 * @swagger
 * /api/reportes/curso/{cursoId}:
 *   get:
 *     tags: [Reportes]
 *     summary: Obtener reportes por curso
 *     description: Retorna todos los reportes de un curso con filtros opcionales por fecha y tipo.
 *     parameters:
 *       - name: cursoId
 *         in: path
 *         required: true
 *         description: ID del curso
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: fechaDesde
 *         in: query
 *         description: Filtrar reportes desde esta fecha (ISO 8601)
 *         schema:
 *           type: string
 *           format: date
 *           example: '2026-06-01'
 *       - name: fechaHasta
 *         in: query
 *         description: Filtrar reportes hasta esta fecha (ISO 8601)
 *         schema:
 *           type: string
 *           format: date
 *           example: '2026-06-30'
 *       - name: tipoReporte
 *         in: query
 *         description: Filtrar por tipo de reporte
 *         schema:
 *           type: string
 *           enum: [asistencia, aviso-diario, reporte-salud]
 *     responses:
 *       200:
 *         description: Reportes del curso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         cursoId:
 *                           type: integer
 *                           example: 1
 *                         totalReportes:
 *                           type: integer
 *                           example: 15
 *                         filtros:
 *                           type: object
 *                         reportes:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ReporteEscolar'
 */
router.get('/curso/:cursoId', reportesController.obtenerReportesPorCurso);

/**
 * @swagger
 * /api/reportes/estadisticas:
 *   get:
 *     tags: [Reportes]
 *     summary: Estadísticas de reportes
 *     description: Retorna el total de reportes y su distribución por tipo. Se puede filtrar por curso.
 *     parameters:
 *       - name: cursoId
 *         in: query
 *         description: Filtrar estadísticas de un curso específico
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Estadísticas de reportes
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalReportes:
 *                           type: integer
 *                           example: 45
 *                         reportesPorTipo:
 *                           type: object
 *                           example:
 *                             asistencia: 20
 *                             aviso-diario: 18
 *                             reporte-salud: 7
 *                         fechaConsulta:
 *                           type: string
 *                           format: date-time
 */
router.get('/estadisticas', reportesController.obtenerEstadisticas);

module.exports = router;
