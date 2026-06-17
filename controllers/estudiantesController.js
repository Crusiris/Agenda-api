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

// Crear un nuevo estudiante
const crearEstudiante = async (req, res) => {
  try {
    const { Estudiante, Curso } = getModels();
    const { nombres, apellidos, rut, cursoId, fechaNacimiento, direccion, edad } = req.body;

    if (!nombres || !apellidos || !cursoId) {
      return res.status(400).json({
        success: false,
        mensaje: 'Los campos nombres, apellidos y cursoId son obligatorios'
      });
    }

    const cursoExiste = await Curso.findByPk(cursoId);
    if (!cursoExiste) {
      return res.status(400).json({
        success: false,
        mensaje: 'El curso especificado no existe'
      });
    }

    const estudiante = await Estudiante.create({
      nombres,
      apellidos,
      rut,
      cursoId,
      fechaNacimiento,
      direccion,
      edad
    });

    const estudianteConCurso = await Estudiante.findByPk(estudiante.id, {
      include: [{ model: Curso, as: 'curso', attributes: ['id', 'nombre', 'nivel'] }]
    });

    res.status(201).json({
      success: true,
      mensaje: 'Estudiante creado exitosamente',
      data: estudianteConCurso
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        mensaje: 'Ya existe un estudiante con ese RUT'
      });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(422).json({
        success: false,
        mensaje: 'Datos de entrada inválidos',
        errores: error.errors.map(e => ({ campo: e.path, mensaje: e.message }))
      });
    }
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear estudiante',
      error: error.message
    });
  }
};

// Actualizar un estudiante
const actualizarEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { Estudiante, Curso } = getModels();
    const { nombres, apellidos, rut, cursoId, fechaNacimiento, direccion, edad, activo } = req.body;

    const estudiante = await Estudiante.findByPk(id);
    if (!estudiante) {
      return res.status(404).json({
        success: false,
        mensaje: 'Estudiante no encontrado'
      });
    }

    if (cursoId) {
      const cursoExiste = await Curso.findByPk(cursoId);
      if (!cursoExiste) {
        return res.status(400).json({
          success: false,
          mensaje: 'El curso especificado no existe'
        });
      }
    }

    await estudiante.update({ nombres, apellidos, rut, cursoId, fechaNacimiento, direccion, edad, activo });

    const estudianteActualizado = await Estudiante.findByPk(id, {
      include: [{ model: Curso, as: 'curso', attributes: ['id', 'nombre', 'nivel'] }]
    });

    res.status(200).json({
      success: true,
      mensaje: 'Estudiante actualizado exitosamente',
      data: estudianteActualizado
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
      mensaje: 'Error al actualizar estudiante',
      error: error.message
    });
  }
};

// Desactivar (soft delete) un estudiante
const desactivarEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { Estudiante } = getModels();

    const estudiante = await Estudiante.findByPk(id);
    if (!estudiante) {
      return res.status(404).json({
        success: false,
        mensaje: 'Estudiante no encontrado'
      });
    }

    await estudiante.update({ activo: false });

    res.status(200).json({
      success: true,
      mensaje: 'Estudiante desactivado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al desactivar estudiante',
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
  crearEstudiante,
  actualizarEstudiante,
  desactivarEstudiante,
  listarApoderadosPorEstudiante
};
