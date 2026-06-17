/**
 * Modelo Apoderado - Sequelize ORM para MySQL
 * Con underscored: true los atributos camelCase mapean a snake_case en la BD
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const Apoderado = (sequelize) => {
  const ApoderadoModel = sequelize.define('Apoderado', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rut: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El RUT es obligatorio' },
        isValidRUT(value) {
          if (!/^\d{7,8}-[\dkK]$/.test(value)) {
            throw new Error('Formato de RUT inválido. Use formato: 12345678-9');
          }
        }
      }
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
    parentesco: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El email es obligatorio' },
        isEmail: { msg: 'Formato de email inválido' }
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase());
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La contraseña es obligatoria' },
        len: {
          args: [6, 255],
          msg: 'La contraseña debe tener al menos 6 caracteres'
        }
      }
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isValidPhone(value) {
          if (value && !/^(\+56)?[0-9]{8,9}$/.test(value.replace(/\s/g, ''))) {
            throw new Error('Formato de teléfono inválido');
          }
        }
      }
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fechaUltimoAcceso: {
      type: DataTypes.DATE,
      allowNull: true
    },
    configuracionesNotificaciones: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      comment: 'Flag global: true = notificaciones habilitadas, false = deshabilitadas'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'apoderados',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (apoderado) => {
        if (apoderado.password) {
          const salt = await bcrypt.genSalt(10);
          apoderado.password = await bcrypt.hash(apoderado.password, salt);
        }
      },
      beforeUpdate: async (apoderado) => {
        if (apoderado.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          apoderado.password = await bcrypt.hash(apoderado.password, salt);
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: ['id', 'rut', 'nombres', 'apellidos', 'parentesco',
          'email', 'telefono', 'password', 'direccion', 'activo',
          'fechaUltimoAcceso', 'configuracionesNotificaciones',
          'createdAt', 'updatedAt'
        ]
      }
    }
  });

  // Métodos de instancia
  ApoderadoModel.prototype.compararPassword = async function(passwordCandidata) {
    return await bcrypt.compare(passwordCandidata, this.password);
  };

  ApoderadoModel.prototype.registrarAcceso = async function() {
    this.fechaUltimoAcceso = new Date();
    return await this.save();
  };

  ApoderadoModel.prototype.puedeRecibirNotificacion = function() {
    return this.activo === true && Boolean(this.configuracionesNotificaciones);
  };

  ApoderadoModel.prototype.obtenerPerfilPublico = function() {
    return {
      id: this.id,
      nombres: this.nombres,
      apellidos: this.apellidos,
      email: this.email,
      parentesco: this.parentesco,
      telefono: this.telefono,
      activo: this.activo,
      createdAt: this.createdAt
    };
  };

  // Métodos estáticos
  ApoderadoModel.validarCredenciales = function(email, password) {
    const errores = [];
    if (!email || !email.includes('@')) errores.push('Email debe tener formato válido');
    if (!password || password.length < 6) errores.push('Contraseña debe tener al menos 6 caracteres');
    return errores;
  };

  return ApoderadoModel;
};

module.exports = Apoderado;
