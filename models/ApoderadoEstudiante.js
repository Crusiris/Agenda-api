const { DataTypes } = require('sequelize');

const ApoderadoEstudiante = (sequelize) => {
  return sequelize.define('ApoderadoEstudiante', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    apoderadoId: {
      type: DataTypes.INTEGER,
      allowNull: false, // ¡Muy importante!
      references: { model: 'apoderados', key: 'id' }
    },
    estudianteId: {
      type: DataTypes.INTEGER,
      allowNull: false, // ¡Muy importante!
      references: { model: 'estudiantes', key: 'id' }
    }
  }, {
    tableName: 'apoderado_estudiante',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['apoderado_id', 'estudiante_id']
      }
    ]
  });
};

module.exports = ApoderadoEstudiante;
