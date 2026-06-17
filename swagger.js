const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Agenda Digital Escolar API',
      version: '2.0.0',
      description: `
## API de comunicación bidireccional entre establecimiento educativo y apoderados

Esta API permite:
- **Docentes** crear y gestionar reportes escolares (asistencia, avisos, salud)
- **Apoderados** consultar el muro de noticias y reportes de sus hijos
- **Contactos** de emergencia asociados a apoderados

### Autenticación
Los endpoints protegidos requieren pasar el ID en los siguientes headers:
- \`x-docente-id\`: ID del docente autenticado
- \`x-apoderado-id\`: ID del apoderado autenticado

> **Nota**: En producción se debe reemplazar por autenticación JWT.
      `,
      contact: {
        name: 'Soporte Agenda Digital',
        email: 'soporte@agendadigital.cl'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Servidor de desarrollo'
      }
    ],
    tags: [
      {
        name: 'Docentes',
        description: 'Gestión de docentes — emisión de reportes y comunicaciones'
      },
      {
        name: 'Apoderados',
        description: 'Notificación y recepción — muro de noticias y reportes de estudiantes'
      },
      {
        name: 'Reportes',
        description: 'Gestión de reportes escolares: asistencia, avisos diarios y salud'
      },
      {
        name: 'Contactos',
        description: 'CRUD de contactos de emergencia asociados a apoderados'
      },
      {
        name: 'Sistema',
        description: 'Estado y salud del sistema'
      }
    ],
    components: {
      schemas: {
        // ─── Schemas de autenticación ──────────────────────────────
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'docente@colegio.cl'
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 6,
              example: 'password123'
            }
          }
        },
        // ─── Docente ───────────────────────────────────────────────
        Docente: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombres: { type: 'string', example: 'María' },
            apellidos: { type: 'string', example: 'González López' },
            email: { type: 'string', format: 'email', example: 'mgonzalez@colegio.cl' },
            rut: { type: 'string', example: '12345678-9' },
            especialidad: { type: 'string', example: 'Matemáticas' },
            telefono: { type: 'string', example: '+56912345678' },
            cursos: {
              type: 'array',
              items: { $ref: '#/components/schemas/Curso' }
            }
          }
        },
        DocenteLoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            mensaje: { type: 'string', example: 'Autenticación exitosa' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'token_1_1718500000000' },
                docente: { $ref: '#/components/schemas/Docente' }
              }
            }
          }
        },
        // ─── Apoderado ─────────────────────────────────────────────
        Apoderado: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombres: { type: 'string', example: 'Carlos' },
            apellidos: { type: 'string', example: 'Pérez Soto' },
            email: { type: 'string', format: 'email', example: 'carlos.perez@gmail.com' },
            rut: { type: 'string', example: '9876543-2' },
            parentesco: { type: 'string', example: 'Padre' },
            telefono: { type: 'string', example: '+56987654321' },
            configuracionesNotificaciones: { type: 'object' },
            estudiantes: {
              type: 'array',
              items: { $ref: '#/components/schemas/Estudiante' }
            }
          }
        },
        ApoderadoLoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            mensaje: { type: 'string', example: 'Autenticación exitosa' },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string', example: 'apoderado_token_1_1718500000000' },
                apoderado: { $ref: '#/components/schemas/Apoderado' }
              }
            }
          }
        },
        // ─── Curso ─────────────────────────────────────────────────
        Curso: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: '3° Básico A' },
            nivel: { type: 'string', example: 'Básica' }
          }
        },
        // ─── Estudiante ────────────────────────────────────────────
        Estudiante: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 5 },
            nombres: { type: 'string', example: 'Valentina' },
            apellidos: { type: 'string', example: 'Pérez González' },
            cursoId: { type: 'integer', example: 1 },
            activo: { type: 'boolean', example: true },
            curso: { $ref: '#/components/schemas/Curso' }
          }
        },
        // ─── Reporte Escolar ───────────────────────────────────────
        ReporteEscolar: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 10 },
            tipoReporte: {
              type: 'string',
              enum: ['asistencia', 'aviso-diario', 'reporte-salud'],
              example: 'aviso-diario'
            },
            cursoId: { type: 'integer', example: 1 },
            estudianteId: { type: 'integer', nullable: true, example: null },
            docenteId: { type: 'integer', example: 2 },
            titulo: { type: 'string', example: 'Aviso reunión de apoderados' },
            contenido: {
              type: 'object',
              description: 'Objeto JSON con el contenido específico según el tipo de reporte'
            },
            fecha: { type: 'string', format: 'date-time', example: '2026-06-16T10:00:00.000Z' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            curso: { $ref: '#/components/schemas/Curso' },
            estudiante: { $ref: '#/components/schemas/Estudiante' }
          }
        },
        TipoReporte: {
          type: 'object',
          properties: {
            tipo: {
              type: 'string',
              enum: ['asistencia', 'aviso-diario', 'reporte-salud']
            },
            nombre: { type: 'string', example: 'Reporte de Asistencia' },
            descripcion: { type: 'string', example: 'Registro diario de asistencia de estudiantes' },
            campos: {
              type: 'array',
              items: { type: 'string' },
              example: ['presente', 'ausente', 'atrasado', 'justificado']
            },
            requiereValidacion: { type: 'boolean', example: true }
          }
        },
        // ─── Contacto ──────────────────────────────────────────────
        Contacto: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Ana Martínez' },
            telefono: { type: 'string', example: '+56911223344' },
            email: { type: 'string', format: 'email', nullable: true, example: 'ana@gmail.com' },
            parentesco: { type: 'string', nullable: true, example: 'Abuela' },
            observaciones: { type: 'string', nullable: true, example: 'Retirar solo los viernes' },
            apoderadoId: { type: 'integer', example: 1 },
            activo: { type: 'boolean', example: true }
          }
        },
        ContactoCreateRequest: {
          type: 'object',
          required: ['nombre', 'telefono', 'apoderadoId'],
          properties: {
            nombre: { type: 'string', example: 'Ana Martínez' },
            telefono: { type: 'string', example: '+56911223344' },
            email: { type: 'string', format: 'email', example: 'ana@gmail.com' },
            parentesco: { type: 'string', example: 'Abuela' },
            observaciones: { type: 'string', example: 'Retirar solo los viernes' },
            apoderadoId: { type: 'integer', example: 1 }
          }
        },
        ContactoUpdateRequest: {
          type: 'object',
          properties: {
            nombre: { type: 'string', example: 'Ana Martínez' },
            telefono: { type: 'string', example: '+56911223344' },
            email: { type: 'string', format: 'email', example: 'ana@gmail.com' },
            parentesco: { type: 'string', example: 'Abuela' },
            observaciones: { type: 'string', example: 'Retirar solo los viernes' }
          }
        },
        // ─── Requests de Reportes ──────────────────────────────────
        CrearReporteRequest: {
          type: 'object',
          required: ['tipoReporte', 'cursoId', 'contenido'],
          properties: {
            tipoReporte: {
              type: 'string',
              enum: ['asistencia', 'aviso-diario', 'reporte-salud'],
              example: 'aviso-diario'
            },
            cursoId: { type: 'integer', example: 1 },
            estudianteId: { type: 'integer', nullable: true, example: null },
            titulo: { type: 'string', example: 'Aviso importante' },
            contenido: {
              type: 'object',
              description: 'Objeto JSON o string con el contenido del reporte',
              example: { texto: 'Mañana no hay clases por feriado.' }
            },
            fecha: { type: 'string', format: 'date', example: '2026-06-16' }
          }
        },
        CrearAsistenciaRequest: {
          type: 'object',
          required: ['cursoId', 'fecha', 'estudiantes'],
          properties: {
            cursoId: { type: 'integer', example: 1 },
            fecha: { type: 'string', format: 'date', example: '2026-06-16' },
            titulo: { type: 'string', example: 'Asistencia 16-06-2026' },
            estudiantes: {
              type: 'array',
              items: {
                type: 'object',
                required: ['estudianteId', 'estado'],
                properties: {
                  estudianteId: { type: 'integer', example: 5 },
                  nombre: { type: 'string', example: 'Valentina Pérez' },
                  estado: {
                    type: 'string',
                    enum: ['presente', 'ausente', 'atrasado', 'justificado'],
                    example: 'presente'
                  }
                }
              }
            }
          }
        },
        CrearAvisoDiarioRequest: {
          type: 'object',
          required: ['cursoId', 'titulo', 'contenido'],
          properties: {
            cursoId: { type: 'integer', example: 1 },
            titulo: { type: 'string', example: 'Reunión de apoderados' },
            contenido: {
              oneOf: [
                { type: 'string', example: 'La reunión es el viernes a las 18:00 hrs.' },
                { type: 'object', example: { texto: 'La reunión es el viernes.', prioridad: 'alta' } }
              ]
            }
          }
        },
        CrearSaludRequest: {
          type: 'object',
          required: ['cursoId', 'estudianteId', 'sintomas'],
          properties: {
            cursoId: { type: 'integer', example: 1 },
            estudianteId: { type: 'integer', example: 5 },
            titulo: { type: 'string', example: 'Reporte de Salud' },
            sintomas: {
              type: 'array',
              items: { type: 'string' },
              example: ['fiebre', 'dolor de cabeza']
            },
            acciones: {
              type: 'array',
              items: { type: 'string' },
              example: ['Se llamó al apoderado', 'Se administró paracetamol']
            },
            requiereAtencion: { type: 'boolean', example: true }
          }
        },
        // ─── Respuestas genéricas ──────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            mensaje: { type: 'string', example: 'Operación exitosa' },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            mensaje: { type: 'string', example: 'Descripción del error' },
            error: { type: 'string', example: 'Detalle técnico del error' }
          }
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            mensaje: { type: 'string', example: 'Error de validación' },
            errores: {
              type: 'array',
              items: { type: 'string' },
              example: ['El RUT es obligatorio', 'Formato de email inválido']
            }
          }
        }
      },
      parameters: {
        DocenteIdHeader: {
          name: 'x-docente-id',
          in: 'header',
          description: 'ID del docente autenticado',
          required: true,
          schema: { type: 'integer', example: 1 }
        },
        ApoderadoIdHeader: {
          name: 'x-apoderado-id',
          in: 'header',
          description: 'ID del apoderado autenticado',
          required: true,
          schema: { type: 'integer', example: 1 }
        }
      }
    },
    paths: {
      // ═══════════════════════════════════════════════════════════
      // SISTEMA — definido aquí porque no tiene archivo de ruta propio
      // ═══════════════════════════════════════════════════════════
      '/': {
        get: {
          tags: ['Sistema'],
          summary: 'Información general de la API',
          description: 'Retorna metadata de la API y lista de endpoints disponibles.',
          responses: {
            200: {
              description: 'Información de la API',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      mensaje: { type: 'string', example: 'API de Agenda Digital Escolar' },
                      version: { type: 'string', example: '2.0.0' },
                      database: { type: 'string', example: 'MySQL + Sequelize ORM' },
                      fecha: { type: 'string', format: 'date-time' },
                      endpoints: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/health': {
        get: {
          tags: ['Sistema'],
          summary: 'Estado de salud del servidor',
          description: 'Verifica el estado de la API y la conexión a la base de datos.',
          responses: {
            200: {
              description: 'API y base de datos operativas',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      api: { type: 'string', example: 'OK' },
                      database: { type: 'object' },
                      timestamp: { type: 'string', format: 'date-time' },
                      uptime: { type: 'number', example: 1234.56 }
                    }
                  }
                }
              }
            },
            500: {
              description: 'Error de conexión a la base de datos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      }
    }
  },
  // Los endpoints de docentes, apoderados, reportes y contactos
  // están documentados con JSDoc directamente en cada archivo de rutas.
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
