const bcrypt = require('bcrypt');
const { getModels } = require('../models');

// Autenticación del docente
const autenticarDocente = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        mensaje: 'Email y contraseña son requeridos'
      });
    }

    const { Docente, Curso } = getModels();
    const docente = await Docente.scope('withPassword').findOne({
      where: { email: email.toLowerCase(), activo: true },
      include: [{ model: Curso, as: 'cursos', attributes: ['id', 'nombre', 'nivel'] }]
    });

    if (!docente) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    const passwordValida = await bcrypt.compare(password, docente.password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    await docente.update({ fechaUltimoAcceso: new Date() });

    // En producción: generar JWT token
    const token = `token_${docente.id}_${Date.now()}`;

    res.status(200).json({
      success: true,
      mensaje: 'Autenticación exitosa',
      data: {
        token,
        docente: {
          id: docente.id,
          nombres: docente.nombres,
          apellidos: docente.apellidos,
          email: docente.email,
          especialidad: docente.especialidad,
          cursos: docente.cursos || []
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error en la autenticación',
      error: error.message
    });
  }
};

// Obtener perfil del docente
const obtenerPerfil = async (req, res) => {
  try {
    const docenteId = req.headers['x-docente-id'] || 1;
    const { Docente, Curso } = getModels();

    const docente = await Docente.findByPk(docenteId, {
      include: [{ model: Curso, as: 'cursos', attributes: ['id', 'nombre', 'nivel'] }]
    });

    if (!docente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Docente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: docente.id,
        nombres: docente.nombres,
        apellidos: docente.apellidos,
        email: docente.email,
        rut: docente.rut,
        especialidad: docente.especialidad,
        telefono: docente.telefono,
        cursos: docente.cursos || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener perfil',
      error: error.message
    });
  }
};

// Obtener cursos asignados al docente
const obtenerCursos = async (req, res) => {
  try {
    const { id } = req.params;
    const { Docente, Curso } = getModels();

    const docente = await Docente.findByPk(id, {
      include: [{ model: Curso, as: 'cursos' }]
    });

    if (!docente) {
      return res.status(404).json({
        success: false,
        mensaje: 'Docente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Cursos obtenidos exitosamente',
      data: docente.cursos || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener cursos',
      error: error.message
    });
  }
};

// Crear reporte (Asistencia, Aviso Diario o Reporte de Salud)
const crearReporte = async (req, res) => {
  try {
    const { tipoReporte, cursoId, estudianteId, titulo, contenido, fecha } = req.body;
    const docenteId = req.headers['x-docente-id'] || 1;

    if (!tipoReporte || !cursoId || !contenido) {
      return res.status(400).json({
        success: false,
        mensaje: 'tipoReporte, cursoId y contenido son requeridos'
      });
    }

    const { ReporteEscolar } = getModels();

    const nuevoReporte = await ReporteEscolar.create({
      tipoReporte,
      cursoId: parseInt(cursoId),
      estudianteId: estudianteId ? parseInt(estudianteId) : null,
      docenteId: parseInt(docenteId),
      titulo: titulo || null,
      contenido: typeof contenido === 'string' ? { texto: contenido } : contenido,
      fecha: fecha ? new Date(fecha) : new Date()
    });

    res.status(201).json({
      success: true,
      mensaje: 'Reporte creado exitosamente',
      data: nuevoReporte
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
      mensaje: 'Error al crear el reporte',
      error: error.message
    });
  }
};

// Obtener historial de reportes del docente
const obtenerReportes = async (req, res) => {
  try {
    const docenteId = req.headers['x-docente-id'] || 1;
    const { ReporteEscolar, Curso, Estudiante } = getModels();

    const reportes = await ReporteEscolar.findAll({
      where: { docenteId: parseInt(docenteId) },
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre', 'nivel'] },
        { model: Estudiante, as: 'estudiante', attributes: ['id', 'nombres', 'apellidos'], required: false }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      mensaje: 'Reportes obtenidos exitosamente',
      data: reportes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener reportes',
      error: error.message
    });
  }
};

// Obtener estudiantes de un curso (por curso_id numérico)
const obtenerEstudiantesPorCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const { Estudiante, Curso } = getModels();

    const curso = await Curso.findByPk(cursoId);
    if (!curso) {
      return res.status(404).json({
        success: false,
        mensaje: 'Curso no encontrado'
      });
    }

    const estudiantes = await Estudiante.findAll({
      where: { cursoId: parseInt(cursoId), activo: true },
      order: [['apellidos', 'ASC'], ['nombres', 'ASC']]
    });

    res.status(200).json({
      success: true,
      mensaje: 'Estudiantes obtenidos exitosamente',
      data: {
        curso,
        total: estudiantes.length,
        estudiantes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener estudiantes',
      error: error.message
    });
  }
};

module.exports = {
  autenticarDocente,
  obtenerPerfil,
  obtenerCursos,
  obtenerEstudiantesPorCurso,
  crearReporte,
  obtenerReportes
};
