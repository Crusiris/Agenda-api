/**
 * Modelo ReporteEscolar - Sequelize ORM para MySQL
 * Con underscored: true los atributos camelCase mapean a snake_case en la BD
 * Solo tiene created_at (no updated_at)
 */

const { DataTypes } = require('sequelize');

const ReporteEscolar = (sequelize) => {
  const ReporteEscolarModel = sequelize.define('ReporteEscolar', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    docenteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'docentes', key: 'id' }
    },
    cursoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'cursos', key: 'id' }
    },
    estudianteId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'estudiantes', key: 'id' }
    },
    tipoReporte: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { notEmpty: { msg: 'El tipo de reporte es obligatorio' } }
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    contenido: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: { notNull: { msg: 'El contenido es obligatorio' } }
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    leidoPor: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }, {
    tableName: 'reportes_escolares',
    timestamps: true,
    updatedAt: false,
    underscored: true
  });

  // Métodos de instancia
  ReporteEscolarModel.prototype.obtenerResumen = function() {
    return {
      id: this.id,
      tipo: this.tipoReporte,
      titulo: this.titulo,
      cursoId: this.cursoId,
      estudianteId: this.estudianteId,
      fecha: this.fecha
    };
  };

  ReporteEscolarModel.prototype.esUrgente = function() {
    return this.tipoReporte === 'reporte-salud';
  };

  return ReporteEscolarModel;
};

module.exports = ReporteEscolar;
