/**
 * Configuración global de tests
 * Configuraciones compartidas y setup común
 */

require('dotenv').config();

// Configuración de entorno de test
process.env.NODE_ENV = 'test';

// Base URLs para tests
const CONFIG = {
  BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:8080',
  DB_NAME: process.env.TEST_DB_NAME || 'agenda_escolar_test',
  TIMEOUT: 10000,
  
  // Configuración de base de datos de test
  TEST_DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: process.env.DB_PORT || 3306,
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    DATABASE: process.env.TEST_DB_NAME || 'agenda_escolar_test'
  }
};

// Colores para logging en tests
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Logger para tests
const logger = {
  info: (msg) => console.log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`),
  success: (msg) => console.log(`${COLORS.green}✅${COLORS.reset} ${msg}`),
  error: (msg) => console.log(`${COLORS.red}❌${COLORS.reset} ${msg}`),
  warning: (msg) => console.log(`${COLORS.yellow}⚠️${COLORS.reset} ${msg}`),
  debug: (msg) => console.log(`${COLORS.dim}🔍${COLORS.reset} ${msg}`),
  test: (msg) => console.log(`${COLORS.cyan}🧪${COLORS.reset} ${msg}`)
};

// Función para limpiar base de datos de test
const cleanTestDB = async () => {
  const { connect, getInstance, disconnect } = require('../../database/connection');
  
  try {
    await connect();
    const sequelize = getInstance();
    
    // Limpiar todas las tablas
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await sequelize.drop();
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    
    logger.success('Base de datos de test limpiada');
  } catch (error) {
    logger.error(`Error limpiando BD de test: ${error.message}`);
    throw error;
  } finally {
    await disconnect();
  }
};

// Datos de test reutilizables
const TEST_DATA = {
  DOCENTE: {
    rut: '12345678-9',
    nombres: 'Test',
    apellidos: 'Docente García',
    email: 'test.docente@test.com',
    password: 'test123456',
    especialidad: 'Matemáticas'
  },
  
  APODERADO: {
    rut: '87654321-K',
    nombres: 'Test',
    apellidos: 'Apoderado Silva',
    email: 'test.apoderado@test.com',
    password: 'test123456',
    parentesco: 'Padre',
    telefono: '+56987654321'
  },
  
  CONTACTO: {
    nombre: 'Test Contacto',
    telefono: '+56912345678',
    email: 'test.contacto@test.com',
    tipo: 'emergencia',
    relacion: 'Abuelo'
  },
  
  REPORTE: {
    tipo: 'asistencia',
    curso: 'TEST1A',
    contenido: {
      fecha: new Date().toISOString().split('T')[0],
      presentes: 25,
      ausentes: 3,
      atrasados: 2,
      observaciones: 'Test de asistencia'
    }
  }
};

module.exports = {
  CONFIG,
  COLORS,
  logger,
  cleanTestDB,
  TEST_DATA
};
