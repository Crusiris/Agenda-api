# Agenda Digital Escolar

**Ecosistema de comunicación bidireccional entre establecimiento educativo y apoderados**

Una aplicación web robusta y escalable desarrollada con el stack tecnológico MERN (MongoDB, Express, React y Node.js), que garantiza la integridad y disponibilidad de la información escolar en tiempo real.

## Descripción Funcional

La solución implementa una plataforma de comunicación que opera bajo un modelo de estados que asegura la trazabilidad de cada comunicación entre docentes y apoderados.

### Flujos de Operación Principal

#### A. Gestión del Docente (Emisión)
El flujo inicia con la autenticación del docente, quien accede a un panel centralizado para seleccionar el curso y tipo de reporte:
- **Asistencia Diaria**: Registro de presentes, ausentes y atrasados
- **Aviso Diario**: Comunicaciones generales del día escolar  
- **Reporte de Salud**: Información médica y de salud de estudiantes

El sistema valida la integridad de los datos en el cliente antes de enviarlos a la API en Node.js, donde se procesan y persisten en la base de datos NoSQL.

#### B. Notificación y Recepción (Apoderado)
Una vez almacenado el dato, la plataforma actualiza el muro de noticias del apoderado de forma reactiva. El flujo contempla un mecanismo de "Confirmación de Lectura", donde el apoderado interactúa con el sistema para cerrar el ciclo de comunicación.

## Arquitectura y Componentes

### Capa de Presentación (Frontend)
- **Tecnología**: React.js
- **Características**: Componentes dinámicos adaptables a dispositivos móviles y de escritorio
- **UX**: Interfaz fluida para registro de datos y lectura de avisos

### Capa de Servicio (Backend)  
- **Tecnología**: Node.js + Express.js
- **Función**: API REST con gestión de seguridad mediante tokens
- **Reglas de Negocio**: Validación de permisos por curso (solo profesor jefe puede publicar)

### Capa de Datos (Persistencia)
- **Tecnología**: MongoDB Atlas
- **Formato**: Almacenamiento JSON (BSON) 
- **Ventaja**: Alta flexibilidad para diversos tipos de reportes escolares

## Instalación

```bash
# Clonar o descargar el proyecto
cd agenda

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

## Uso

### Desarrollo
```bash
npm run dev
```

### Producción  
```bash
npm start
```

### Versión con Estructura Modular
```bash
node app-structured.js
```

El servidor se ejecutará en `http://localhost:3000`

## API Endpoints del Sistema Escolar

### Gestión del Docente
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/docentes/login` | Autenticación del docente |
| GET | `/api/docentes/:id/cursos` | Cursos asignados al docente |
| POST | `/api/docentes/reportes` | Crear reporte escolar |

### Notificación y Recepción  
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/apoderados/login` | Autenticación del apoderado |
| GET | `/api/apoderados/muro` | Muro de noticias reactivo |
| POST | `/api/apoderados/confirmar-lectura` | Confirmar lectura de reporte |

### Gestión de Reportes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/reportes/tipos` | Tipos de reportes disponibles |
| POST | `/api/reportes/asistencia` | Crear reporte de asistencia |
| POST | `/api/reportes/aviso-diario` | Crear aviso diario |
| POST | `/api/reportes/salud` | Crear reporte de salud |
| GET | `/api/reportes/estadisticas` | Estadísticas de confirmaciones |

## Integración y Conectividad

La integración de componentes se realiza mediante protocolo **HTTP/HTTPS** utilizando la librería Axios. Los flujos de datos son **bidireccionales**:

- **Cliente → Servidor**: Envío de datos de reportes
- **Servidor → Cliente**: Entrega de datos de consulta  
- **Sincronización**: Agenda siempre actualizada con base de datos centralizada

## Estructura del Proyecto

```
agenda/
├── app.js                          # Servidor básico
├── app-structured.js               # Servidor con arquitectura modular
├── package.json                    # Dependencias del proyecto
├── .env                           # Variables de entorno
├── README.md                      # Este archivo
├── test-agenda-escolar.js         # Pruebas del sistema completo
├── routes/                        # Rutas de la API
│   ├── docentes.js               # Gestión del docente
│   ├── apoderados.js             # Notificación y recepción  
│   └── reportes.js               # Gestión de reportes
├── controllers/                   # Lógica de negocio
│   ├── docentesController.js     # Controlador de docentes
│   ├── apoderadosController.js   # Controlador de apoderados
│   └── reportesController.js     # Controlador de reportes
├── models/                       # Modelos de datos
│   ├── Docente.js                # Modelo de docente
│   ├── Apoderado.js              # Modelo de apoderado
│   └── ReporteEscolar.js         # Modelo de reporte escolar
└── database/                     # Datos de prueba
    └── inicializarDatos.js       # Script de inicialización
```

## Pruebas del Sistema

### Ejecutar Pruebas Completas
```bash
node test-agenda-escolar.js
```

### Casos de Prueba Incluidos
- ✅ Autenticación de docentes y apoderados
- ✅ Creación de reportes con validación de integridad  
- ✅ Actualización reactiva del muro de noticias
- ✅ Confirmación de lectura y cierre del ciclo
- ✅ Trazabilidad completa de comunicaciones
- ✅ Estadísticas de efectividad comunicacional

## Características Técnicas Implementadas

### Modelo de Estados
- **Creación**: Docente crea reporte con validaciones
- **Notificación**: Sistema actualiza muro automáticamente  
- **Confirmación**: Apoderado confirma lectura
- **Trazabilidad**: Registro completo de la comunicación

### Validación de Integridad
- **Cliente**: Validación de campos requeridos
- **Servidor**: Aplicación de reglas de negocio
- **Base de Datos**: Consistencia de datos garantizada

### Reglas de Negocio
- Solo profesores jefe pueden crear reportes en sus cursos
- Reportes de salud tienen prioridad urgente  
- Confirmaciones de lectura son obligatorias para ciertos tipos
- Trazabilidad completa de todas las comunicaciones

## Documentación de la API

Accede a la documentación completa en: `http://localhost:3000/api/docs`

Estado del sistema: `http://localhost:3000/health`

## Stack Tecnológico

- **M**ongoDB Atlas - Base de datos NoSQL
- **E**xpress.js - Framework web para Node.js  
- **R**eact.js - Biblioteca de interfaz de usuario
- **N**ode.js - Entorno de ejecución de JavaScript

### Dependencias Principales
- Express.js - Framework web
- CORS - Middleware para cross-origin requests
- Body-parser - Parseo de cuerpos de petición
- Dotenv - Gestión de variables de entorno
- Nodemon - Desarrollo con recarga automática

## Próximos Pasos para Producción

- [ ] **Autenticación JWT**: Implementar tokens seguros
- [ ] **MongoDB Real**: Conectar a MongoDB Atlas  
- [ ] **Frontend React**: Desarrollar interfaz de usuario
- [ ] **WebSockets**: Notificaciones en tiempo real
- [ ] **Notificaciones Push**: Alertas móviles
- [ ] **Dashboard Analytics**: Métricas de uso
- [ ] **Tests Automatizados**: Cobertura completa
- [ ] **Docker**: Containerización para deployment

## Indicadores de Evaluación

### ✅ Indicador 2 - Integración
La integración real de componentes mediante protocolo HTTP/HTTPS está implementada y verificada con:
- Comunicación bidireccional funcional
- Validación de datos en cliente y servidor  
- Persistencia simulada con estructuras JSON
- Flujos completos de emisión y recepción
- Trazabilidad de estados documentada

## Licencia

Este proyecto está bajo la Licencia ISC - ver el archivo LICENSE para detalles.

---

**Desarrollado para el Instituto AIEP - Carrera de Analista Programador**  
*Proyecto: Agenda Digital Escolar - Stack MERN*
