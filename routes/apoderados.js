const express = require('express');
const router = express.Router();
const apoderadosController = require('../controllers/apoderadosController');

/**
 * @swagger
 * tags:
 *   name: Apoderados
 *   description: Notificación y recepción — muro de noticias y reportes de estudiantes
 */

/**
 * @swagger
 * /api/apoderados/login:
 *   post:
 *     tags: [Apoderados]
 *     summary: Autenticación del apoderado
 *     description: Autentica al apoderado con email y contraseña. Retorna un token y el perfil con sus hijos (estudiantes) y sus cursos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: carlos.perez@gmail.com
 *             password: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApoderadoLoginResponse'
 *       400:
 *         description: Email o contraseña faltantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', apoderadosController.autenticarApoderado);

/**
 * @swagger
 * /api/apoderados/muro:
 *   get:
 *     tags: [Apoderados]
 *     summary: Obtener muro de noticias
 *     description: Retorna todos los reportes y avisos de los cursos de los hijos del apoderado, ordenados por fecha descendente. Requiere el header `x-apoderado-id`.
 *     parameters:
 *       - $ref: '#/components/parameters/ApoderadoIdHeader'
 *     responses:
 *       200:
 *         description: Muro de noticias del apoderado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalNoticias:
 *                           type: integer
 *                           example: 5
 *                         noticias:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ReporteEscolar'
 *                         ultimaActualizacion:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Apoderado no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/muro', apoderadosController.obtenerMuroNoticias);

/**
 * @swagger
 * /api/apoderados/confirmar-lectura:
 *   post:
 *     tags: [Apoderados]
 *     summary: Confirmar lectura de un reporte
 *     description: Registra que el apoderado leyó el reporte indicado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reporteId]
 *             properties:
 *               reporteId:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Lectura confirmada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         reporteId:
 *                           type: integer
 *                           example: 10
 *                         fechaConfirmacion:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: reporteId faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Reporte no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/confirmar-lectura', apoderadosController.confirmarLectura);

/**
 * @swagger
 * /api/apoderados/hijos:
 *   get:
 *     tags: [Apoderados]
 *     summary: Obtener lista de hijos del apoderado
 *     description: Retorna todos los estudiantes asociados al apoderado autenticado, con información de su curso. Requiere el header `x-apoderado-id`.
 *     parameters:
 *       - $ref: '#/components/parameters/ApoderadoIdHeader'
 *     responses:
 *       200:
 *         description: Lista de hijos (estudiantes)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Estudiante'
 *       404:
 *         description: Apoderado no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/hijos', apoderadosController.obtenerHijos);

/**
 * @swagger
 * /api/apoderados/reportes/{estudianteId}:
 *   get:
 *     tags: [Apoderados]
 *     summary: Obtener reportes de un estudiante
 *     description: Retorna los reportes del curso del estudiante indicado. Valida que el estudiante pertenezca al apoderado. Requiere el header `x-apoderado-id`.
 *     parameters:
 *       - $ref: '#/components/parameters/ApoderadoIdHeader'
 *       - name: estudianteId
 *         in: path
 *         required: true
 *         description: ID del estudiante
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Reportes del estudiante
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         estudianteId:
 *                           type: integer
 *                           example: 5
 *                         totalReportes:
 *                           type: integer
 *                           example: 12
 *                         reportes:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ReporteEscolar'
 *       403:
 *         description: Sin permisos para ver reportes de este estudiante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/reportes/:estudianteId', apoderadosController.obtenerReportesEstudiante);

module.exports = router;
