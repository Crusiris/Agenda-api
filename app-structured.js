const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Importar rutas del sistema escolar
const docentesRoutes = require('./routes/docentes');
const apoderadosRoutes = require('./routes/apoderados');
const reportesRoutes = require('./routes/reportes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para logging (opcional)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Bienvenido a la Agenda Digital Escolar',
    descripcion: 'Ecosistema de comunicación bidireccional entre establecimiento educativo y apoderados',
    version: '1.0.0',
    stack: 'MERN (MongoDB, Express, React, Node.js)',
    fecha: new Date().toISOString(),
    endpoints: {
      docentes: '/api/docentes',
      apoderados: '/api/apoderados',
      cursos: '/api/cursos',
      reportes: '/api/reportes',
      documentacion: '/api/docs'
    }
  });
});

// Ruta de salud del sistema
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Usar las rutas del sistema escolar
app.use('/api/docentes', docentesRoutes);
app.use('/api/apoderados', apoderadosRoutes);
app.use('/api/reportes', reportesRoutes);

// Ruta de documentación de la API Escolar
app.get('/api/docs', (req, res) => {
  res.json({
    titulo: 'Documentación API - Agenda Digital Escolar',
    descripcion: 'Ecosistema de comunicación bidireccional entre establecimiento educativo y apoderados',
    version: '1.0.0',
    stack: 'MERN (MongoDB, Express, React, Node.js)',
    arquitectura: {
      capaPresentacion: 'React.js - Interfaz adaptativa móvil/escritorio',
      capaServicio: 'Node.js + Express.js - API REST con autenticación JWT',
      capaDatos: 'MongoDB Atlas - Almacenamiento NoSQL flexible'
    },
    endpoints: [
      {
        categoria: 'Gestión del Docente (Emisión)',
        rutas: [
          {
            metodo: 'POST',
            ruta: '/api/docentes/login',
            descripcion: 'Autenticación del docente',
            body: {
              email: 'string (requerido)',
              password: 'string (requerido)'
            }
          },
          {
            metodo: 'POST',
            ruta: '/api/docentes/reportes',
            descripcion: 'Crear reporte (Asistencia, Aviso Diario, Reporte de Salud)',
            body: {
              tipo: 'string (asistencia|aviso-diario|reporte-salud)',
              curso: 'string (requerido)',
              contenido: 'object (requerido)'
            }
          },
          {
            metodo: 'GET',
            ruta: '/api/docentes/:id/cursos',
            descripcion: 'Obtener cursos asignados al docente'
          }
        ]
      },
      {
        categoria: 'Notificación y Recepción (Apoderado)',
        rutas: [
          {
            metodo: 'POST',
            ruta: '/api/apoderados/login',
            descripcion: 'Autenticación del apoderado'
          },
          {
            metodo: 'GET',
            ruta: '/api/apoderados/muro',
            descripcion: 'Obtener muro de noticias actualizado reactivamente'
          },
          {
            metodo: 'POST',
            ruta: '/api/apoderados/confirmar-lectura',
            descripcion: 'Confirmar lectura de reporte (cierre del ciclo de comunicación)',
            body: {
              reporteId: 'number (requerido)',
              comentario: 'string (opcional)'
            }
          }
        ]
      },
      {
        categoria: 'Gestión de Reportes Escolares',
        rutas: [
          {
            metodo: 'GET',
            ruta: '/api/reportes/tipos',
            descripcion: 'Obtener tipos de reportes disponibles'
          },
          {
            metodo: 'POST',
            ruta: '/api/reportes/asistencia',
            descripcion: 'Crear reporte de asistencia con validación de integridad'
          },
          {
            metodo: 'GET',
            ruta: '/api/reportes/estadisticas',
            descripcion: 'Obtener estadísticas de confirmaciones de lectura'
          }
        ]
      }
    ],
    flujoOperacion: {
      paso1: 'Docente se autentica y selecciona curso',
      paso2: 'Sistema valida permisos (solo profesor jefe puede publicar en su curso)',
      paso3: 'Docente crea reporte con validación de integridad en cliente y servidor',
      paso4: 'API procesa y persiste en MongoDB Atlas (formato BSON)',
      paso5: 'Sistema actualiza muro de noticias del apoderado reactivamente',
      paso6: 'Apoderado confirma lectura cerrando el ciclo de comunicación',
      paso7: 'Sistema registra trazabilidad completa de la comunicación'
    },
    integracionHTTP: 'Protocolo HTTP/HTTPS con librería Axios para comunicación bidireccional'
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    mensaje: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    mensaje: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📅 Aplicación de Agenda iniciada correctamente`);
  console.log(`📖 Documentación disponible en http://localhost:${PORT}/api/docs`);
  console.log(`💚 Estado del sistema en http://localhost:${PORT}/health`);
});

module.exports = app;
