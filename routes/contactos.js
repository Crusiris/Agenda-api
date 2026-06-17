const express = require('express');
const router = express.Router();
const contactosController = require('../controllers/contactosController');

// GET /api/contactos - Obtener todos los contactos
router.get('/', contactosController.obtenerContactos);

// POST /api/contactos - Crear un nuevo contacto
router.post('/', contactosController.crearContacto);

// GET /api/contactos/:id - Obtener un contacto por ID
router.get('/:id', contactosController.obtenerContactoPorId);

// PUT /api/contactos/:id - Actualizar un contacto
router.put('/:id', contactosController.actualizarContacto);

// DELETE /api/contactos/:id - Eliminar un contacto
router.delete('/:id', contactosController.eliminarContacto);

module.exports = router;
