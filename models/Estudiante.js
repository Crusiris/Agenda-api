/**
 * Modelo Estudiante - Sequelize ORM para MySQL
 * Con underscored: true → cursoId mapea a curso_id en la BD
 */

const { DataTypes } = require('sequelize');

const Estudiante = (sequelize) => {
  return sequelize.define('Estudiante', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rut: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: true
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: { msg: 'Los nombres son obligatorios' } }
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: { msg: 'Los apellidos son obligatorios' } }
    },
    fechaNacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cursoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'cursos', key: 'id' }
    },
    edad: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'estudiantes',
    timestamps: true,
    underscored: true
  });
};

module.exports = Estudiante;
