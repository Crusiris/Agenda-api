const { getModels } = require('../models');

// Listar todos los estudiantes activos
const listarEstudiantes = async (req, res) => {
  try {
    const { Estudiante, Curso } = getModels();
    const { cursoId, activo } = req.query;

    const where = {};
    if (cursoId) where.cursoId = cursoId;
    if (activo !== undefined) where.activo = activo === 'true';

    const estudiantes = await Estudiante.findAll({
      where,
      include: [{ model: Curso, as: 'curso', attributes: ['id', 'nombre', 'nivel'] }],
      order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: estudiantes,
      total: estudiantes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener estudiantes',
      error: error.message
    });
  }
};

// Obtener un estudiante por ID
const obtenerEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { Estudiante, Curso, Apoderado } = getModels();

    const estudiante = await Estudiante.findByPk(id, {
      include: [
        { model: Curso,     as: 'curso',      attributes: ['id', 'nombre', 'nivel'] },
        { model: Apoderado, as: 'apoderados', attributes: ['id', 'nombres', 'apellidos', 'email', 'telefono', 'parentesco'] }
      ]
    });

    if (!estudiante) {
      return res.status(404).json({
        success: false,
        mensaje: 'Estudiante no encontrado'
      });
    }

    res.status(200).json({ success: true, data: estudiante });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener estudiante',
      error: error.message
    });
  }
};

// Listar apoderados de un estudiante
const listarApoderadosPorEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { Estudiante, Apoderado } = getModels();

    const estudiante = await Estudiante.findByPk(id, {
      include: [{
        model: Apoderado,
        as: 'apoderados',
        attributes: ['id', 'nombres', 'apellidos', 'email', 'telefono', 'parentesco', 'activo'],
        through: { attributes: [] }
      }]
    });

    if (!estudiante) {
      return res.status(404).json({
        success: false,
        mensaje: 'Estudiante no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        estudiante: { id: estudiante.id, nombres: estudiante.nombres, apellidos: estudiante.apellidos },
        apoderados: estudiante.apoderados
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener apoderados del estudiante',
      error: error.message
    });
  }
};

module.exports = {
  listarEstudiantes,
  obtenerEstudiante,
  listarApoderadosPorEstudiante
};
