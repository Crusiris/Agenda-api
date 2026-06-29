const { DataTypes } = require('sequelize');

const ApoderadoEstudiante = (sequelize) => {
  return sequelize.define('ApoderadoEstudiante', {
    apoderadoId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: { model: 'apoderados', key: 'id' }
    },
    estudianteId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: { model: 'estudiantes', key: 'id' }
    }
  }, {
    tableName: 'apoderado_estudiante',
    timestamps: false,
    underscored: true
  });
};

module.exports = ApoderadoEstudiante;
