const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { getModels } = require('../models');

// Autenticación del apoderado
const autenticarApoderado = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        mensaje: 'Email y contraseña son requeridos'
      });
    }

    const { Apoderado, Estudiante, Curso } = getModels();
    const apoderado = await Apoderado.scope('withPassword').findOne({
      where: { email: email.toLowerCase(), activo: true },
      include: [{
        model: Estudiante,
        as: 'estudiantes',
        include: [{ model: Curso, as: 'curso', attributes: ['id', 'nombre', 'nivel'] }]
      }]
    });

    if (!apoderado) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    const passwordValida = await bcrypt.compare(password, apoderado.password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    await apoderado.update({ fechaUltimoAcceso: new Date() });

    const token = `apoderado_token_${apoderado.id}_${Date.now()}`;

    res.status(200).json({
      success: true,
      mensaje: 'Autenticación exitosa',
      data: {
        token,
        apoderado: {
          id: apoderado.id,
          nombres: apoderado.nombres,
          apellidos: apoderado.apellidos,
          email: apoderado.email,
          parentesco: apoderado.parentesco,
          configuracionesNotificaciones: apoderado.configuracionesNotificaciones,
          estudiantes: apoderado.estudiantes || []
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

// Obtener muro de noticias del apoderado
const obtenerMuroNoticias = async (req, res) => {
  try {
    const apoderadoId = Number(req.headers['x-apoderado-id'] || 1);
    const { Apoderado, ReporteEscolar, Estudiante, Curso } = getModels();

    const apoderado = await Apoderado.findByPk(apoderadoId, {
      include: [{ model: Estudiante, as: 'estudiantes' }]
    });

    if (!apoderado) {
      return res.status(404).json({
        success: false,
        mensaje: 'Apoderado no encontrado'
      });
    }

    const cursoIds = (apoderado.estudiantes || []).map(e => e.cursoId).filter(Boolean);

    const reportes = await ReporteEscolar.findAll({
      where: { cursoId: { [Op.in]: cursoIds } },
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre', 'nivel'] },
        { model: Estudiante, as: 'estudiante', attributes: ['id', 'nombres', 'apellidos'], required: false }
      ],
      order: [['createdAt', 'DESC']]
    });

    const noticiasConLeido = reportes.map(r => {
      const raw = r.toJSON();
      const leidoPor = Array.isArray(raw.leidoPor) ? raw.leidoPor : [];
      return { ...raw, leido: leidoPor.includes(apoderadoId) };
    });

    res.status(200).json({
      success: true,
      mensaje: 'Muro de noticias actualizado',
      data: {
        totalNoticias: noticiasConLeido.length,
        noticias: noticiasConLeido,
        ultimaActualizacion: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener muro de noticias',
      error: error.message
    });
  }
};

// Confirmar lectura de un reporte
const confirmarLectura = async (req, res) => {
  try {
    const apoderadoId = Number(req.headers['x-apoderado-id'] || 1);
    const { reporteId } = req.body;

    if (!reporteId) {
      return res.status(400).json({
        success: false,
        mensaje: 'ID del reporte es requerido'
      });
    }

    const { ReporteEscolar } = getModels();
    const reporte = await ReporteEscolar.findByPk(reporteId);

    if (!reporte) {
      return res.status(404).json({
        success: false,
        mensaje: 'Reporte no encontrado'
      });
    }

    const leidoPor = Array.isArray(reporte.leidoPor) ? [...reporte.leidoPor] : [];
    if (!leidoPor.includes(apoderadoId)) {
      leidoPor.push(apoderadoId);
      await reporte.update({ leidoPor });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Lectura registrada exitosamente',
      data: {
        reporteId,
        leido: true,
        fechaConfirmacion: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al confirmar lectura',
      error: error.message
    });
  }
};

// Obtener lista de hijos/estudiantes del apoderado
const obtenerHijos = async (req, res) => {
  try {
    const apoderadoId = req.headers['x-apoderado-id'] || 1;
    const { Apoderado, Estudiante, Curso } = getModels();

    const apoderado = await Apoderado.findByPk(apoderadoId, {
      include: [{
        model: Estudiante,
        as: 'estudiantes',
        include: [{ model: Curso, as: 'curso', attributes: ['id', 'nombre', 'nivel'] }]
      }]
    });

    if (!apoderado) {
      return res.status(404).json({
        success: false,
        mensaje: 'Apoderado no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Estudiantes obtenidos exitosamente',
      data: apoderado.estudiantes || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener estudiantes',
      error: error.message
    });
  }
};

// Obtener reportes específicos de un estudiante
const obtenerReportesEstudiante = async (req, res) => {
  try {
    const { estudianteId } = req.params;
    const apoderadoId = req.headers['x-apoderado-id'] || 1;
    const { Apoderado, ReporteEscolar, Estudiante, Curso } = getModels();

    // Verificar que el estudiante pertenece a este apoderado
    const apoderado = await Apoderado.findByPk(apoderadoId, {
      include: [{
        model: Estudiante,
        as: 'estudiantes',
        where: { id: parseInt(estudianteId) },
        required: false
      }]
    });

    const hijo = apoderado?.estudiantes?.[0];

    if (!hijo) {
      return res.status(403).json({
        success: false,
        mensaje: 'No tiene permisos para ver reportes de este estudiante'
      });
    }

    const reportes = await ReporteEscolar.findAll({
      where: { cursoId: hijo.cursoId },
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre', 'nivel'] },
        { model: Estudiante, as: 'estudiante', attributes: ['id', 'nombres', 'apellidos'], required: false }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      mensaje: 'Reportes del estudiante obtenidos exitosamente',
      data: {
        estudianteId: parseInt(estudianteId),
        totalReportes: reportes.length,
        reportes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener reportes del estudiante',
      error: error.message
    });
  }
};

// Registro de nuevo apoderado (solo puede hacerlo un docente autenticado)
const registrarApoderado = async (req, res) => {
  try {
    const docenteId = req.headers['x-docente-id'];
    if (!docenteId) {
      return res.status(401).json({ success: false, mensaje: 'Solo un docente autenticado puede registrar usuarios' });
    }

    const { nombres, apellidos, rut, email, password, parentesco } = req.body;

    if (!nombres || !apellidos || !rut || !email || !password) {
      return res.status(400).json({
        success: false,
        mensaje: 'Nombres, apellidos, RUT, email y contraseña son requeridos'
      });
    }

    const { Apoderado } = getModels();

    const existe = await Apoderado.findOne({
      where: { [Op.or]: [{ email: email.toLowerCase() }, { rut }] }
    });

    if (existe) {
      return res.status(409).json({
        success: false,
        mensaje: 'Ya existe una cuenta con ese email o RUT'
      });
    }

    const apoderado = await Apoderado.create({
      nombres,
      apellidos,
      rut,
      email,
      password,
      parentesco: parentesco || null
    });

    const token = `apoderado_token_${apoderado.id}_${Date.now()}`;

    res.status(201).json({
      success: true,
      mensaje: 'Cuenta creada exitosamente',
      data: {
        token,
        apoderado: {
          id: apoderado.id,
          nombres: apoderado.nombres,
          apellidos: apoderado.apellidos,
          email: apoderado.email,
          parentesco: apoderado.parentesco,
          configuracionesNotificaciones: apoderado.configuracionesNotificaciones,
          estudiantes: []
        }
      }
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        mensaje: error.errors[0].message
      });
    }
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear la cuenta',
      error: error.message
    });
  }
};

module.exports = {
  autenticarApoderado,
  registrarApoderado,
  obtenerMuroNoticias,
  confirmarLectura,
  obtenerHijos,
  obtenerReportesEstudiante
};
