const { DataTypes } = require('sequelize');

const Curso = (sequelize) => {
  return sequelize.define('Curso', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'El nombre del curso es obligatorio' } }
    },
    nivel: {
      type: DataTypes.STRING,
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'cursos',
    timestamps: true,
    updatedAt: false,
    underscored: true
  });
};

module.exports = Curso;
