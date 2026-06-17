/**
 * Modelo Contacto - Sequelize ORM para MySQL
 * Contactos de emergencia asociados a un apoderado
 * Con underscored: true apoderadoId mapea a apoderado_id en la BD
 */

const { DataTypes } = require('sequelize');

const Contacto = (sequelize) => {
  const ContactoModel = sequelize.define('Contacto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    apoderadoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'apoderados', key: 'id' }
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El nombre es obligatorio' },
        len: { args: [2, 100], msg: 'El nombre debe tener entre 2 y 100 caracteres' }
      }
    },
    parentesco: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El teléfono es obligatorio' },
        isValidPhone(value) {
          if (!/^(\+56)?[0-9]{8,9}$/.test(value.replace(/\s/g, ''))) {
            throw new Error('Formato de teléfono inválido');
          }
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: { isEmail: { msg: 'Formato de email inválido' } },
      set(value) {
        if (value) this.setDataValue('email', value.toLowerCase());
      }
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'contactos',
    timestamps: true,
    underscored: true
  });

  // Métodos estáticos
  ContactoModel.validarEmail = function(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  ContactoModel.validarTelefono = function(telefono) {
    return /^(\+56)?[0-9]{8,9}$/.test(telefono.replace(/\s/g, ''));
  };

  // Métodos de instancia
  ContactoModel.prototype.marcarComoInactivo = function() {
    this.activo = false;
    return this.save();
  };

  ContactoModel.prototype.obtenerInformacionCompleta = function() {
    return {
      id: this.id,
      nombre: this.nombre,
      parentesco: this.parentesco,
      telefono: this.telefono,
      email: this.email,
      observaciones: this.observaciones,
      activo: this.activo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  };

  return ContactoModel;
};

module.exports = Contacto;

