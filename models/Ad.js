const { DataTypes } = require('sequelize');

/**
 * Modelo Ad — anuncios/publicidad de la aplicación
 */
const Ad = (sequelize) => {
  const AdModel = sequelize.define('Ad', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'El título del anuncio es obligatorio' } }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imagenUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    enlaceUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'ad',
    timestamps: true,
    updatedAt: false,
    underscored: true
  });

  AdModel.prototype.estaActivo = function() {
    const ahora = new Date();
    const inicioOk = !this.fechaInicio || ahora >= this.fechaInicio;
    const finOk    = !this.fechaFin    || ahora <= this.fechaFin;
    return this.activo && inicioOk && finOk;
  };

  return AdModel;
};

module.exports = Ad;
