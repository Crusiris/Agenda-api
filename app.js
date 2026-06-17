const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importar configuración de base de datos y modelos
const { connect, setupEvents, syncModels } = require('./database/connection');
const { initializeModels } = require('./models');

// Importar rutas
const docentesRoutes = require('./routes/docentes');
const apoderadosRoutes = require('./routes/apoderados');
const contactosRoutes = require('./routes/contactos');
const reportesRoutes = require('./routes/reportes');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Inicialización de la base de datos
const initializeDatabase = async () => {
  try {
    console.log('🚀 Iniciando servidor de Agenda Digital Escolar...');
    
    // Conectar a MySQL
    await connect();
    
    // Configurar eventos de la aplicación
    setupEvents();
    
    // Sincronizar modelos
    await syncModels(false);
    
    // Inicializar modelos
    initializeModels();
    
    console.log('✅ Base de datos MySQL conectada y modelos inicializados');
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
};

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Agenda Digital Escolar',
    version: '2.0.0',
    database: 'MySQL + Sequelize ORM',
    fecha: new Date().toISOString(),
    endpoints: {
      docentes: '/api/docentes',
      apoderados: '/api/apoderados',
      contactos: '/api/contactos',
      reportes: '/api/reportes'
    }
  });
});

// Rutas de la API
app.use('/api/docentes', docentesRoutes);
app.use('/api/apoderados', apoderadosRoutes);
app.use('/api/contactos', contactosRoutes);
app.use('/api/reportes', reportesRoutes);
// Ruta de salud para verificar estado de la API y BD
app.get('/api/health', async (req, res) => {
  try {
    const { getStatus } = require('./database/connection');
    const dbStatus = await getStatus();
    
    res.json({
      api: 'OK',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      api: 'OK',
      database: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    mensaje: 'La ruta solicitada no existe en esta API',
    rutasDisponibles: [
      'GET /',
      'GET /api/health',
      'GET /api/docentes',
      'GET /api/apoderados',
      'GET /api/contactos',
      'GET /api/reportes'
    ]
  });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error('❌ Error interno:', err.stack);
  
  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      detalles: err.errors.map(e => ({
        campo: e.path,
        mensaje: e.message
      }))
    });
  }
  
  // Error de conexión de base de datos
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      error: 'Error de conexión a la base de datos',
      mensaje: 'Servicio temporalmente no disponible'
    });
  }
  
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: 'Ha ocurrido un error inesperado'
  });
});

// Función principal para iniciar la aplicación
const startServer = async () => {
  try {
    // Inicializar base de datos
    await initializeDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✅ Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📅 API de Agenda Digital Escolar lista`);
      console.log(`🗄️  Base de datos: MySQL + Sequelize ORM`);
      console.log(`🌐 CORS habilitado para: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    });
    
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Iniciar la aplicación
if (require.main === module) {
  startServer();
}

module.exports = app;
