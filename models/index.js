/**
 * Índice de Modelos - Inicialización de Sequelize
 * Configura todas las relaciones entre modelos según el nuevo esquema
 */

const { getInstance } = require('../database/connection');

// Modelos principales
const DocenteModel           = require('./Docente');
const ApoderadoModel         = require('./Apoderado');
const EstudianteModel        = require('./Estudiante');
const ContactoModel          = require('./Contacto');
const ReporteEscolarModel    = require('./ReporteEscolar');
const CursoModel             = require('./Curso');
// Tablas intermedias (N:M)
const DocEnteCursoModel      = require('./DocEnteCurso');
const ApoderadoEstudianteModel = require('./ApoderadoEstudiante');
// Anuncios
const AdModel                = require('./Ad');

let models = {};

const initializeModels = () => {
  const sequelize = getInstance();

  if (!sequelize) {
    throw new Error('Sequelize no está inicializado. Llama a connect() primero.');
  }

  models.Docente             = DocenteModel(sequelize);
  models.Apoderado           = ApoderadoModel(sequelize);
  models.Estudiante          = EstudianteModel(sequelize);
  models.Contacto            = ContactoModel(sequelize);
  models.ReporteEscolar      = ReporteEscolarModel(sequelize);
  models.Curso               = CursoModel(sequelize);
  models.DocEnteCurso        = DocEnteCursoModel(sequelize);
  models.ApoderadoEstudiante = ApoderadoEstudianteModel(sequelize);
  models.Ad                  = AdModel(sequelize);

  setupAssociations();

  return models;
};

const setupAssociations = () => {
  const {
    Docente, Apoderado, Estudiante, Contacto,
    ReporteEscolar, Curso, DocEnteCurso, ApoderadoEstudiante
  } = models;

  // ── Docente <-> Curso  (N:M via docente_curso) ─────────────────
  Docente.belongsToMany(Curso, {
    through: DocEnteCurso,
    foreignKey: 'docenteId',
    otherKey: 'cursoId',
    as: 'cursos'
  });
  Curso.belongsToMany(Docente, {
    through: DocEnteCurso,
    foreignKey: 'cursoId',
    otherKey: 'docenteId',
    as: 'docentes'
  });

  // ── Estudiante -> Curso  (N:1) ─────────────────────────────────
  Estudiante.belongsTo(Curso, { foreignKey: 'cursoId', as: 'curso' });
  Curso.hasMany(Estudiante,   { foreignKey: 'cursoId', as: 'estudiantes' });

  // ── Apoderado <-> Estudiante  (N:M via apoderado_estudiante) ───
  Apoderado.belongsToMany(Estudiante, {
    through: ApoderadoEstudiante,
    foreignKey: 'apoderado_id',
    otherKey: 'estudiante_id',
    as: 'estudiantes'
  });
  Estudiante.belongsToMany(Apoderado, {
    through: ApoderadoEstudiante,
    foreignKey: 'estudiante_id',
    otherKey: 'apoderado_id',
    as: 'apoderados'
  });

  // ── Apoderado -> Contacto  (1:N) ───────────────────────────────
  Apoderado.hasMany(Contacto,  { foreignKey: 'apoderadoId', as: 'contactos' });
  Contacto.belongsTo(Apoderado, { foreignKey: 'apoderadoId', as: 'apoderado' });

  // ── Docente -> ReporteEscolar  (1:N) ───────────────────────────
  Docente.hasMany(ReporteEscolar,      { foreignKey: 'docenteId', as: 'reportes' });
  ReporteEscolar.belongsTo(Docente,   { foreignKey: 'docenteId', as: 'docente' });

  // ── Curso -> ReporteEscolar  (1:N) ─────────────────────────────
  Curso.hasMany(ReporteEscolar,        { foreignKey: 'cursoId', as: 'reportes' });
  ReporteEscolar.belongsTo(Curso,     { foreignKey: 'cursoId', as: 'curso' });

  // ── Estudiante -> ReporteEscolar  (1:N, nullable) ──────────────
  Estudiante.hasMany(ReporteEscolar,   { foreignKey: 'estudianteId', as: 'reportes' });
  ReporteEscolar.belongsTo(Estudiante, { foreignKey: 'estudianteId', as: 'estudiante' });
};

const getModels = () => {
  if (Object.keys(models).length === 0) {
    return initializeModels();
  }
  return models;
};

module.exports = { initializeModels, getModels, setupAssociations };

