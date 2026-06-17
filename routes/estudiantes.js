const express = require('express');
const router = express.Router();
const estudiantesController = require('../controllers/estudiantesController');

/**
 * @swagger
 * tags:
 *   name: Estudiantes
 *   description: >
 *     Consulta de estudiantes. Los estudiantes son cargados mediante el script de
 *     inicialización y no se crean desde el frontend.
 */

/**
 * @swagger
 * /api/estudiantes:
 *   get:
 *     tags: [Estudiantes]
 *     summary: Listar estudiantes
 *     description: Retorna la lista de todos los estudiantes. Se puede filtrar por curso o estado.
 *     parameters:
 *       - in: query
 *         name: cursoId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de curso
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo (por defecto retorna todos)
 *     responses:
 *       200:
 *         description: Lista de estudiantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Estudiante'
 *                 total:
 *                   type: integer
 *                   example: 6
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/', estudiantesController.listarEstudiantes);

/**
 * @swagger
 * /api/estudiantes/{id}:
 *   get:
 *     tags: [Estudiantes]
 *     summary: Obtener un estudiante por ID
 *     description: Retorna los datos completos de un estudiante, incluyendo su curso y apoderados.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *     responses:
 *       200:
 *         description: Datos del estudiante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Estudiante'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id', estudiantesController.obtenerEstudiante);

/**
 * @swagger
 * /api/estudiantes/{id}/apoderados:
 *   get:
 *     tags: [Estudiantes]
 *     summary: Obtener apoderados de un estudiante
 *     description: Retorna la lista de apoderados vinculados a un estudiante (relación N:M).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *     responses:
 *       200:
 *         description: Apoderados del estudiante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     estudiante:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         nombres:
 *                           type: string
 *                         apellidos:
 *                           type: string
 *                     apoderados:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Apoderado'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id/apoderados', estudiantesController.listarApoderadosPorEstudiante);

module.exports = router;
