const { DataTypes } = require('sequelize');

/**
 * Tabla intermedia docente_curso — relación N:M entre Docente y Curso
 * Con underscored: true, docenteId → docente_id y cursoId → curso_id en la BD
 */
const DocEnteCurso = (sequelize) => {
  return sequelize.define('DocEnteCurso', {
    docenteId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: { model: 'docentes', key: 'id' }
    },
    cursoId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: { model: 'cursos', key: 'id' }
    }
  }, {
    tableName: 'docente_curso',
    timestamps: false,
    underscored: true
  });
};

module.exports = DocEnteCurso;
