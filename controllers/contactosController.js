const { getModels } = require('../models');

// Obtener todos los contactos
const obtenerContactos = async (req, res) => {
  try {
    const { Contacto } = getModels();
    const contactos = await Contacto.findAll({ where: { activo: true } });

    res.status(200).json({
      success: true,
      mensaje: 'Contactos obtenidos exitosamente',
      data: contactos,
      total: contactos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener los contactos',
      error: error.message
    });
  }
};

// Crear un nuevo contacto
const crearContacto = async (req, res) => {
  try {
    const { nombre, telefono, email, parentesco, observaciones, apoderadoId } = req.body;

    if (!nombre || !telefono || !apoderadoId) {
      return res.status(400).json({
        success: false,
        mensaje: 'Los campos nombre, telefono y apoderadoId son requeridos'
      });
    }

    const { Contacto } = getModels();

    if (email) {
      const emailExiste = await Contacto.findOne({ where: { email: email.toLowerCase() } });
      if (emailExiste) {
        return res.status(400).json({
          success: false,
          mensaje: 'Ya existe un contacto con este email'
        });
      }
    }

    const nuevoContacto = await Contacto.create({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      email: email ? email.trim().toLowerCase() : null,
      parentesco: parentesco || null,
      observaciones: observaciones || null,
      apoderadoId: parseInt(apoderadoId)
    });

    res.status(201).json({
      success: true,
      mensaje: 'Contacto creado exitosamente',
      data: nuevoContacto
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación',
        errores: error.errors.map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear el contacto',
      error: error.message
    });
  }
};

// Obtener un contacto por ID
const obtenerContactoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { Contacto } = getModels();
    const contacto = await Contacto.findByPk(id);

    if (!contacto || !contacto.activo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Contacto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Contacto encontrado',
      data: contacto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el contacto',
      error: error.message
    });
  }
};

// Actualizar un contacto
const actualizarContacto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, email, parentesco, observaciones } = req.body;

    if (!nombre && !telefono && !email && !parentesco && !observaciones) {
      return res.status(400).json({
        success: false,
        mensaje: 'Debe proporcionar al menos un campo para actualizar'
      });
    }

    const { Contacto } = getModels();
    const contacto = await Contacto.findByPk(id);

    if (!contacto || !contacto.activo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Contacto no encontrado'
      });
    }

    const camposActualizar = {};
    if (nombre) camposActualizar.nombre = nombre.trim();
    if (telefono) camposActualizar.telefono = telefono.trim();
    if (email) camposActualizar.email = email.trim().toLowerCase();
    if (parentesco !== undefined) camposActualizar.parentesco = parentesco;
    if (observaciones !== undefined) camposActualizar.observaciones = observaciones;

    await contacto.update(camposActualizar);

    res.status(200).json({
      success: true,
      mensaje: 'Contacto actualizado exitosamente',
      data: contacto
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación',
        errores: error.errors.map(e => e.message)
      });
    }
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar el contacto',
      error: error.message
    });
  }
};

// Eliminar un contacto (soft delete)
const eliminarContacto = async (req, res) => {
  try {
    const { id } = req.params;
    const { Contacto } = getModels();
    const contacto = await Contacto.findByPk(id);

    if (!contacto || !contacto.activo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Contacto no encontrado'
      });
    }

    await contacto.update({ activo: false });

    res.status(200).json({
      success: true,
      mensaje: 'Contacto eliminado exitosamente',
      data: contacto
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar el contacto',
      error: error.message
    });
  }
};

module.exports = {
  obtenerContactos,
  crearContacto,
  obtenerContactoPorId,
  actualizarContacto,
  eliminarContacto
};
