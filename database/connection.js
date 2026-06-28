/**
 * Configuración de Conexión MySQL - Agenda Digital Escolar
 * Implementa Sequelize ORM para la conexión con MySQL
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

class DatabaseConnection {
  constructor() {
    this.sequelize = null;
  }

  /**
   * Conecta a MySQL usando Sequelize
   */
  async connect() {
    try {
      console.log('🔌 Iniciando conexión a MySQL...');

      const isProd = process.env.NODE_ENV === 'production';

      // Aiven (y otros proveedores cloud) exigen SSL — se activa en producción
      // o cuando DB_SSL=true está explícitamente definido.
      const useSSL = isProd || process.env.DB_SSL === 'true';

      const dialectOptions = {
        charset: 'utf8mb4',
        ...(useSSL && {
          ssl: {
            require: true,
            rejectUnauthorized: false, // Aiven usa cert autofirmado
          },
        }),
      };

      // Soporte para DB_URL (Aiven / Render) o variables individuales (local)
      if (process.env.DB_URL) {
        this.sequelize = new Sequelize(process.env.DB_URL, {
          dialect: 'mysql',
          logging: isProd ? false : console.log,
          pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
          define: { timestamps: true, underscored: true, charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
          dialectOptions,
        });
      } else {
        this.sequelize = new Sequelize(
          process.env.DB_NAME || 'agenda_escolar',
          process.env.DB_USER || 'root',
          process.env.DB_PASSWORD || '',
          {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            dialect: 'mysql',
            logging: isProd ? false : console.log,
            pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
            define: { timestamps: true, underscored: true, charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
            dialectOptions,
          },
        );
      }

      // Autenticar conexión
      await this.sequelize.authenticate();

      if (process.env.DB_URL) {
        console.log('✅ Conexión exitosa a MySQL (DB_URL)');
      } else {
        console.log('✅ Conexión exitosa a MySQL');
        console.log(`📍 Base de datos: ${process.env.DB_NAME || 'agenda_escolar'}`);
        console.log(`🌐 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
      }
      
      return this.sequelize;
    } catch (error) {
      console.error('❌ Error conectando a MySQL:', error.message);
      throw error;
    }
  }

  /**
   * Ejecuta una consulta SQL directa
   */
  async query(sql, options = {}) {
    try {
      if (!this.sequelize) {
        throw new Error('No hay conexión a la base de datos');
      }

      return await this.sequelize.query(sql, {
        type: this.sequelize.QueryTypes.RAW,
        ...options
      });
    } catch (error) {
      console.error('❌ Error ejecutando consulta:', error.message);
      throw error;
    }
  }

  /**
   * Sincroniza los modelos con la base de datos
   */
  async syncModels(force = false) {
    try {
      if (!this.sequelize) {
        throw new Error('No hay conexión a la base de datos');
      }

      console.log('🔄 Sincronizando modelos con la base de datos...');
      await this.sequelize.sync({ force });
      console.log('✅ Modelos sincronizados correctamente');
    } catch (error) {
      console.error('❌ Error sincronizando modelos:', error.message);
      throw error;
    }
  }

  /**
   * Desconecta de MySQL
   */
  async disconnect() {
    try {
      if (this.sequelize) {
        await this.sequelize.close();
        console.log('🔌 Desconectado de MySQL');
      }
    } catch (error) {
      console.error('❌ Error al desconectar:', error.message);
    }
  }

  /**
   * Obtiene la instancia de Sequelize
   */
  getInstance() {
    return this.sequelize;
  }

  /**
   * Obtiene el estado de la conexión
   */
  async getConnectionStatus() {
    try {
      if (!this.sequelize) {
        return { state: 'disconnected' };
      }

      await this.sequelize.authenticate();
      return {
        state: 'connected',
        database: this.sequelize.config.database,
        host: this.sequelize.config.host,
        port: this.sequelize.config.port
      };
    } catch (error) {
      return { state: 'error', error: error.message };
    }
  }

  /**
   * Maneja eventos de la aplicación
   */
  setupConnectionEvents() {
    // Manejo de cierre graceful
    process.on('SIGINT', async () => {
      console.log('🛑 Cerrando aplicación...');
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('🛑 Terminando aplicación...');
      await this.disconnect();
      process.exit(0);
    });
  }
}

// Crear instancia singleton
const dbConnection = new DatabaseConnection();

module.exports = {
  connect: () => dbConnection.connect(),
  disconnect: () => dbConnection.disconnect(),
  query: (sql, options) => dbConnection.query(sql, options),
  syncModels: (force) => dbConnection.syncModels(force),
  getInstance: () => dbConnection.getInstance(),
  getStatus: () => dbConnection.getConnectionStatus(),
  setupEvents: () => dbConnection.setupConnectionEvents(),
  sequelize: dbConnection.sequelize
};
