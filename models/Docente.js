/**
 * Modelo Docente - Sequelize ORM para MySQL
 * Con underscored: true los atributos camelCase mapean a snake_case en la BD
 * (e.g. fechaUltimoAcceso → fecha_ultimo_acceso)
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const Docente = (sequelize) => {
  const DocenteModel = sequelize.define('Docente', {
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
    especialidad: {
      type: DataTypes.STRING(100),
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
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    fechaUltimoAcceso: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'docentes',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (docente) => {
        if (docente.password) {
          const salt = await bcrypt.genSalt(10);
          docente.password = await bcrypt.hash(docente.password, salt);
        }
      },
      beforeUpdate: async (docente) => {
        if (docente.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          docente.password = await bcrypt.hash(docente.password, salt);
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: ['id', 'rut', 'nombres', 'apellidos', 'especialidad',
          'email', 'telefono', 'password', 'activo',
          'fechaUltimoAcceso', 'createdAt', 'updatedAt']
      }
    }
  });

  // Métodos de instancia
  DocenteModel.prototype.definirPermisos = function() {
    const permisosBase = [
      'crear_reportes',
      'ver_asistencia',
      'enviar_avisos'
    ];
    
    if (this.esProfesorJefe) {
      return [
        ...permisosBase,
        'gestionar_curso',
        'ver_estadisticas_completas',
        'contactar_apoderados'
      ];
    }
    
    return permisosBase;
  };

  /**
   * Verifica si el docente tiene asignado un curso (requiere eager-load de 'cursos')
   * o hace una consulta en tiempo real.
   */
  DocenteModel.prototype.puedeCrearReporteEnCurso = async function(cursoId) {
    const cursos = await this.getCursos({ where: { id: cursoId } });
    return cursos.length > 0;
  };

  DocenteModel.prototype.compararPassword = async function(passwordCandidata) {
    return await bcrypt.compare(passwordCandidata, this.password);
  };

  DocenteModel.prototype.registrarAcceso = async function() {
    this.fechaUltimoAcceso = new Date();
    return await this.save();
  };

  DocenteModel.prototype.obtenerPerfilPublico = function() {
    return {
      id: this.id,
      nombres: this.nombres,
      apellidos: this.apellidos,
      especialidad: this.especialidad,
      email: this.email,
      cursos: this.cursos || [],   // disponible si se cargó la asociación
      createdAt: this.createdAt
    };
  };

  // Métodos estáticos
  DocenteModel.validarCredenciales = function(email, password) {
    const errores = [];
    
    if (!email || !email.includes('@')) {
      errores.push('Email debe tener formato válido');
    }
    
    if (!password || password.length < 6) {
      errores.push('Contraseña debe tener al menos 6 caracteres');
    }
    
    return errores;
  };

  return DocenteModel;
};

module.exports = Docente;
