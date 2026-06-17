const express = require('express');
const router = express.Router();
const contactosController = require('../controllers/contactosController');

/**
 * @swagger
 * tags:
 *   name: Contactos
 *   description: CRUD de contactos de emergencia asociados a apoderados
 */

/**
 * @swagger
 * /api/contactos:
 *   get:
 *     tags: [Contactos]
 *     summary: Obtener todos los contactos activos
 *     description: Retorna la lista de todos los contactos de emergencia activos registrados en el sistema.
 *     responses:
 *       200:
 *         description: Lista de contactos
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
 *                   example: Contactos obtenidos exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contacto'
 *                 total:
 *                   type: integer
 *                   example: 8
 *   post:
 *     tags: [Contactos]
 *     summary: Crear nuevo contacto de emergencia
 *     description: Crea un contacto de emergencia asociado a un apoderado. El email debe ser único si se proporciona.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactoCreateRequest'
 *           example:
 *             nombre: Ana Martínez
 *             telefono: '+56911223344'
 *             email: ana.martinez@gmail.com
 *             parentesco: Abuela
 *             observaciones: Solo puede retirar los viernes
 *             apoderadoId: 1
 *     responses:
 *       201:
 *         description: Contacto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Contacto'
 *       400:
 *         description: Campos requeridos faltantes, email duplicado o error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
router.get('/', contactosController.obtenerContactos);
router.post('/', contactosController.crearContacto);

/**
 * @swagger
 * /api/contactos/{id}:
 *   get:
 *     tags: [Contactos]
 *     summary: Obtener contacto por ID
 *     description: Retorna un contacto activo por su ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del contacto
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Contacto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Contacto'
 *       404:
 *         description: Contacto no encontrado o inactivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags: [Contactos]
 *     summary: Actualizar contacto
 *     description: Actualiza los campos del contacto. Debe enviarse al menos un campo.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del contacto a actualizar
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactoUpdateRequest'
 *     responses:
 *       200:
 *         description: Contacto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Contacto'
 *       400:
 *         description: Sin campos para actualizar o error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Contacto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags: [Contactos]
 *     summary: Eliminar contacto (soft delete)
 *     description: "Desactiva el contacto marcando `activo: false`. No elimina el registro físicamente de la base de datos."
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del contacto a eliminar
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Contacto eliminado (desactivado) exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Contacto'
 *       404:
 *         description: Contacto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', contactosController.obtenerContactoPorId);
router.put('/:id', contactosController.actualizarContacto);
router.delete('/:id', contactosController.eliminarContacto);

module.exports = router;
