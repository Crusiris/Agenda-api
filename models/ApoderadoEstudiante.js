const { DataTypes } = require('sequelize');

const ApoderadoEstudiante = (sequelize) => {
  return sequelize.define('ApoderadoEstudiante', {
    apoderado_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'apoderados', key: 'id' }
    },
    estudiante_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'estudiantes', key: 'id' }
    }
  }, {
    tableName: 'apoderado_estudiante',
    timestamps: false
  });
};

module.exports = ApoderadoEstudiante;
