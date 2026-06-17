const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');

/**
 * @swagger
 * tags:
 *   name: Anuncios
 *   description: Gestión de anuncios y publicaciones (creados desde el frontend)
 */

/**
 * @swagger
 * /api/ad:
 *   get:
 *     tags: [Anuncios]
 *     summary: Listar anuncios
 *     description: Retorna todos los anuncios. Con `soloActivos=true` filtra por fecha de vigencia.
 *     parameters:
 *       - in: query
 *         name: soloActivos
 *         schema:
 *           type: boolean
 *         description: Si es true, retorna solo los anuncios vigentes (activo=true y dentro del rango de fechas)
 *     responses:
 *       200:
 *         description: Lista de anuncios
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
 *                     $ref: '#/components/schemas/Ad'
 *                 total:
 *                   type: integer
 *                   example: 3
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/', adController.listarAnuncios);

/**
 * @swagger
 * /api/ad:
 *   post:
 *     tags: [Anuncios]
 *     summary: Crear un anuncio
 *     description: Registra un nuevo anuncio. Se puede definir un rango de vigencia con `fechaInicio` y `fechaFin`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdCreateRequest'
 *     responses:
 *       201:
 *         description: Anuncio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: Anuncio creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Ad'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/', adController.crearAnuncio);

/**
 * @swagger
 * /api/ad/{id}:
 *   get:
 *     tags: [Anuncios]
 *     summary: Obtener un anuncio por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del anuncio
 *     responses:
 *       200:
 *         description: Datos del anuncio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Ad'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id', adController.obtenerAnuncio);

/**
 * @swagger
 * /api/ad/{id}:
 *   put:
 *     tags: [Anuncios]
 *     summary: Actualizar un anuncio
 *     description: Modifica los datos de un anuncio existente. Solo se actualizan los campos enviados.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del anuncio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdUpdateRequest'
 *     responses:
 *       200:
 *         description: Anuncio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: Anuncio actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Ad'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/:id', adController.actualizarAnuncio);

/**
 * @swagger
 * /api/ad/{id}:
 *   delete:
 *     tags: [Anuncios]
 *     summary: Desactivar un anuncio (soft delete)
 *     description: Marca el anuncio como inactivo (`activo=false`). No elimina el registro.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del anuncio
 *     responses:
 *       200:
 *         description: Anuncio desactivado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: Anuncio desactivado exitosamente
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:id', adController.desactivarAnuncio);

module.exports = router;
