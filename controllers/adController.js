const { getModels } = require('../models');

// Listar anuncios activos (para el frontend)
const listarAnuncios = async (req, res) => {
  try {
    const { Ad } = getModels();
    const { soloActivos } = req.query;

    const where = {};
    if (soloActivos === 'true') where.activo = true;

    const anuncios = await Ad.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    // Filtrar por rango de fechas si soloActivos es true
    const resultado = soloActivos === 'true'
      ? anuncios.filter(a => a.estaActivo())
      : anuncios;

    res.status(200).json({
      success: true,
      data: resultado,
      total: resultado.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener anuncios',
      error: error.message
    });
  }
};

// Obtener un anuncio por ID
const obtenerAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const { Ad } = getModels();

    const anuncio = await Ad.findByPk(id);
    if (!anuncio) {
      return res.status(404).json({
        success: false,
        mensaje: 'Anuncio no encontrado'
      });
    }

    res.status(200).json({ success: true, data: anuncio });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener anuncio',
      error: error.message
    });
  }
};

// Crear un nuevo anuncio
const crearAnuncio = async (req, res) => {
  try {
    const { Ad } = getModels();
    const { titulo, descripcion, imagenUrl, enlaceUrl, activo, fechaInicio, fechaFin } = req.body;

    if (!titulo) {
      return res.status(400).json({
        success: false,
        mensaje: 'El campo título es obligatorio'
      });
    }

    const anuncio = await Ad.create({
      titulo,
      descripcion,
      imagenUrl,
      enlaceUrl,
      activo: activo !== undefined ? activo : true,
      fechaInicio,
      fechaFin
    });

    res.status(201).json({
      success: true,
      mensaje: 'Anuncio creado exitosamente',
      data: anuncio
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(422).json({
        success: false,
        mensaje: 'Datos de entrada inválidos',
        errores: error.errors.map(e => ({ campo: e.path, mensaje: e.message }))
      });
    }
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear anuncio',
      error: error.message
    });
  }
};

// Actualizar un anuncio
const actualizarAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const { Ad } = getModels();
    const { titulo, descripcion, imagenUrl, enlaceUrl, activo, fechaInicio, fechaFin } = req.body;

    const anuncio = await Ad.findByPk(id);
    if (!anuncio) {
      return res.status(404).json({
        success: false,
        mensaje: 'Anuncio no encontrado'
      });
    }

    await anuncio.update({ titulo, descripcion, imagenUrl, enlaceUrl, activo, fechaInicio, fechaFin });

    res.status(200).json({
      success: true,
      mensaje: 'Anuncio actualizado exitosamente',
      data: anuncio
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(422).json({
        success: false,
        mensaje: 'Datos de entrada inválidos',
        errores: error.errors.map(e => ({ campo: e.path, mensaje: e.message }))
      });
    }
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar anuncio',
      error: error.message
    });
  }
};

// Desactivar un anuncio (soft delete)
const desactivarAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const { Ad } = getModels();

    const anuncio = await Ad.findByPk(id);
    if (!anuncio) {
      return res.status(404).json({
        success: false,
        mensaje: 'Anuncio no encontrado'
      });
    }

    await anuncio.update({ activo: false });

    res.status(200).json({
      success: true,
      mensaje: 'Anuncio desactivado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al desactivar anuncio',
      error: error.message
    });
  }
};

module.exports = {
  listarAnuncios,
  obtenerAnuncio,
  crearAnuncio,
  actualizarAnuncio,
  desactivarAnuncio
};
