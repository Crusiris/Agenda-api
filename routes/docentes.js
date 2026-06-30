const express = require('express');
const router = express.Router();
const docentesController = require('../controllers/docentesController');

/**
 * @swagger
 * tags:
 *   name: Docentes
 *   description: Gestión de docentes — emisión de reportes y comunicaciones
 */

/**
 * @swagger
 * /api/docentes/login:
 *   post:
 *     tags: [Docentes]
 *     summary: Autenticación del docente
 *     description: Autentica al docente con email y contraseña. Retorna un token y los datos del perfil con cursos asignados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: mgonzalez@colegio.cl
 *             password: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocenteLoginResponse'
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
router.post('/registro', docentesController.registrarDocente);
router.post('/login', docentesController.autenticarDocente);

/**
 * @swagger
 * /api/docentes/perfil:
 *   get:
 *     tags: [Docentes]
 *     summary: Obtener perfil del docente autenticado
 *     description: Retorna los datos del perfil del docente junto con sus cursos asignados. Requiere el header `x-docente-id`.
 *     parameters:
 *       - $ref: '#/components/parameters/DocenteIdHeader'
 *     responses:
 *       200:
 *         description: Perfil del docente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Docente'
 *       404:
 *         description: Docente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/perfil', docentesController.obtenerPerfil);

/**
 * @swagger
 * /api/docentes/{id}/cursos:
 *   get:
 *     tags: [Docentes]
 *     summary: Obtener cursos asignados al docente
 *     description: Retorna la lista de cursos asignados al docente con el ID indicado.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del docente
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de cursos del docente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Curso'
 *       404:
 *         description: Docente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/cursos', docentesController.obtenerCursos);

/**
 * @swagger
 * /api/docentes/reportes:
 *   post:
 *     tags: [Docentes]
 *     summary: Crear reporte escolar (genérico)
 *     description: Crea un reporte de cualquier tipo (asistencia, aviso-diario, reporte-salud). Requiere el header `x-docente-id`.
 *     parameters:
 *       - $ref: '#/components/parameters/DocenteIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearReporteRequest'
 *     responses:
 *       201:
 *         description: Reporte creado exitosamente
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
 *   get:
 *     tags: [Docentes]
 *     summary: Historial de reportes del docente
 *     description: Retorna todos los reportes creados por el docente autenticado. Requiere el header `x-docente-id`.
 *     parameters:
 *       - $ref: '#/components/parameters/DocenteIdHeader'
 *     responses:
 *       200:
 *         description: Lista de reportes del docente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ReporteEscolar'
 */
router.post('/reportes', docentesController.crearReporte);
router.get('/reportes', docentesController.obtenerReportes);

/**
 * @swagger
 * /api/docentes/cursos/{cursoId}/estudiantes:
 *   get:
 *     tags: [Docentes]
 *     summary: Listar estudiantes de un curso
 *     description: Retorna todos los estudiantes activos del curso indicado, ordenados por apellido.
 *     parameters:
 *       - name: cursoId
 *         in: path
 *         required: true
 *         description: ID del curso
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Estudiantes del curso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         curso:
 *                           $ref: '#/components/schemas/Curso'
 *                         total:
 *                           type: integer
 *                           example: 30
 *                         estudiantes:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Estudiante'
 *       404:
 *         description: Curso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/cursos/:cursoId/estudiantes', docentesController.obtenerEstudiantesPorCurso);

module.exports = router;
