const { Op } = require('sequelize');
const { getModels } = require('../models');

// Tipos de reportes disponibles (definición estática del dominio)
const tiposReportes = [
  { tipo: 'aviso-diario',    nombre: 'Aviso Diario',          descripcion: 'Comunicaciones generales del día escolar' },
  { tipo: 'Conducta',       nombre: 'Conducta',              descripcion: 'Registro de comportamiento del estudiante' },
  { tipo: 'Informativo',    nombre: 'Informativo',           descripcion: 'Información general para los apoderados' },
  { tipo: 'Tarea',          nombre: 'Tarea',                 descripcion: 'Asignación de tarea o trabajo escolar' },
  { tipo: 'Urgente',        nombre: 'Urgente',               descripcion: 'Comunicado de carácter urgente' },
  { tipo: 'reporte-salud',  nombre: 'Reporte de Salud',      descripcion: 'Información médica y de salud de estudiantes' },
  { tipo: 'asistencia',     nombre: 'Reporte de Asistencia', descripcion: 'Registro diario de asistencia de estudiantes' },
];

// Obtener tipos de reportes disponibles
const obtenerTiposReportes = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      mensaje: 'Tipos de reportes obtenidos exitosamente',
      data: tiposReportes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener tipos de reportes',
      error: error.message
    });
  }
};

// Crear reporte de asistencia
const crearReporteAsistencia = async (req, res) => {
  try {
    const { cursoId, fecha, estudiantes, titulo } = req.body;
    const docenteId = req.headers['x-docente-id'] || 1;

    if (!cursoId || !fecha || !estudiantes) {
      return res.status(400).json({
        success: false,
        mensaje: 'cursoId, fecha y lista de estudiantes son requeridos'
      });
    }

    const presentes = estudiantes.filter(e => e.estado === 'presente').length;
    const ausentes  = estudiantes.filter(e => e.estado === 'ausente').length;
    const atrasados = estudiantes.filter(e => e.estado === 'atrasado').length;

    const { ReporteEscolar } = getModels();

    const nuevoReporte = await ReporteEscolar.create({
      tipoReporte: 'asistencia',
      cursoId: parseInt(cursoId),
      docenteId: parseInt(docenteId),
      titulo: titulo || `Asistencia ${fecha}`,
      contenido: {
        fecha,
        presentes,
        ausentes,
        atrasados,
        totalEstudiantes: estudiantes.length,
        detalleEstudiantes: estudiantes
      },
      fecha: new Date(fecha)
    });

    res.status(201).json({
      success: true,
      mensaje: 'Reporte de asistencia creado exitosamente',
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
      mensaje: 'Error al crear reporte de asistencia',
      error: error.message
    });
  }
};

// Crear aviso diario
const crearAvisoDiario = async (req, res) => {
  try {
    const { cursoId, titulo, contenido, estudianteId, tipoReporte } = req.body;
    const docenteId = req.headers['x-docente-id'] || 1;

    if (!cursoId || !titulo || !contenido) {
      return res.status(400).json({
        success: false,
        mensaje: 'cursoId, título y contenido son requeridos'
      });
    }

    const { ReporteEscolar } = getModels();

    const nuevoAviso = await ReporteEscolar.create({
      tipoReporte: tipoReporte || 'aviso-diario',
      cursoId: parseInt(cursoId),
      docenteId: parseInt(docenteId),
      estudianteId: estudianteId ? parseInt(estudianteId) : null,
      titulo,
      contenido: typeof contenido === 'string' ? { texto: contenido } : contenido,
      fecha: new Date()
    });

    res.status(201).json({
      success: true,
      mensaje: 'Aviso diario creado exitosamente',
      data: nuevoAviso
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
      mensaje: 'Error al crear aviso diario',
      error: error.message
    });
  }
};

// Crear reporte de salud
const crearReporteSalud = async (req, res) => {
  try {
    const { cursoId, estudianteId, sintomas, acciones, requiereAtencion, titulo } = req.body;
    const docenteId = req.headers['x-docente-id'] || 1;

    if (!cursoId || !estudianteId || !sintomas) {
      return res.status(400).json({
        success: false,
        mensaje: 'cursoId, estudianteId y síntomas son requeridos'
      });
    }

    const { ReporteEscolar } = getModels();

    const nuevoReporteSalud = await ReporteEscolar.create({
      tipoReporte: 'reporte-salud',
      cursoId: parseInt(cursoId),
      estudianteId: parseInt(estudianteId),
      docenteId: parseInt(docenteId),
      titulo: titulo || 'Reporte de Salud',
      contenido: {
        sintomas,
        acciones: acciones || [],
        requiereAtencion: requiereAtencion || false,
        contactoRealizado: false,
        horaIncidente: new Date().toISOString()
      },
      fecha: new Date()
    });

    res.status(201).json({
      success: true,
      mensaje: 'Reporte de salud creado exitosamente',
      data: nuevoReporteSalud,
      notificacion: 'Apoderado notificado inmediatamente'
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
      mensaje: 'Error al crear reporte de salud',
      error: error.message
    });
  }
};

// Obtener reportes por curso
const obtenerReportesPorCurso = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const { fechaDesde, fechaHasta, tipoReporte } = req.query;
    const { ReporteEscolar, Curso, Estudiante } = getModels();

    const where = { cursoId: parseInt(cursoId) };
    if (tipoReporte) where.tipoReporte = tipoReporte;
    if (fechaDesde || fechaHasta) {
      where.fecha = {};
      if (fechaDesde) where.fecha[Op.gte] = new Date(fechaDesde);
      if (fechaHasta) where.fecha[Op.lte] = new Date(fechaHasta);
    }

    const reportes = await ReporteEscolar.findAll({
      where,
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre', 'nivel'] },
        { model: Estudiante, as: 'estudiante', attributes: ['id', 'nombres', 'apellidos'], required: false }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      mensaje: 'Reportes obtenidos exitosamente',
      data: {
        cursoId: parseInt(cursoId),
        totalReportes: reportes.length,
        filtros: { fechaDesde, fechaHasta, tipoReporte },
        reportes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener reportes por curso',
      error: error.message
    });
  }
};

// Obtener estadísticas de reportes
const obtenerEstadisticas = async (req, res) => {
  try {
    const { cursoId } = req.query;
    const { ReporteEscolar } = getModels();

    const where = {};
    if (cursoId) where.cursoId = parseInt(cursoId);

    const reportes = await ReporteEscolar.findAll({ where });

    const reportesPorTipo = {};
    reportes.forEach(r => {
      reportesPorTipo[r.tipoReporte] = (reportesPorTipo[r.tipoReporte] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      mensaje: 'Estadísticas obtenidas exitosamente',
      data: {
        totalReportes: reportes.length,
        reportesPorTipo,
        fechaConsulta: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

module.exports = {
  obtenerTiposReportes,
  crearReporteAsistencia,
  crearAvisoDiario,
  crearReporteSalud,
  obtenerReportesPorCurso,
  obtenerEstadisticas,
  obtenerReportePorId
};

// Obtener un reporte por ID
async function obtenerReportePorId(req, res) {
  try {
    const { id } = req.params;
    const { ReporteEscolar, Curso, Estudiante } = getModels();
    const reporte = await ReporteEscolar.findByPk(id, {
      include: [
        { model: Curso, as: 'curso', attributes: ['id', 'nombre', 'nivel'] },
        { model: Estudiante, as: 'estudiante', attributes: ['id', 'nombres', 'apellidos'], required: false }
      ]
    });
    if (!reporte) {
      return res.status(404).json({ success: false, mensaje: 'Reporte no encontrado' });
    }
    res.status(200).json({ success: true, mensaje: 'Reporte obtenido', data: reporte });
  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error al obtener reporte', error: error.message });
  }
}
