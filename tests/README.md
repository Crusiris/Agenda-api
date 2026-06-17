# 🧪 Suite de Tests - Agenda Digital Escolar

Estructura completa de tests organizados por categorías para garantizar la calidad y funcionamiento de la aplicación.

## 📁 Estructura de Tests

```
tests/
├── 📋 run-all.js              # Runner principal de todos los tests
├── 🛠️  helpers/
│   ├── config.js              # Configuración global de tests
│   └── utils.js               # Utilidades y helpers reutilizables
├── 🗄️  database/
│   ├── connection.test.js     # Test de conexión MySQL
│   └── models.test.js         # Test completo de modelos Sequelize
├── 🧪 unit/
│   ├── docente.test.js        # Tests unitarios del modelo Docente
│   └── apoderado.test.js      # Tests unitarios del modelo Apoderado
├── 🔗 integration/
│   └── api.test.js            # Tests de integración de la API
└── 🎭 e2e/
    └── complete-flow.test.js  # Tests end-to-end de flujos completos
```

## 🚀 Comandos de Tests

### Tests Principales

```bash
# Ejecutar TODOS los tests
npm test
npm run test:all

# Tests por categoría
npm run test:db          # Solo tests de base de datos
npm run test:unit        # Solo tests unitarios
npm run test:integration # Solo tests de integración  
npm run test:e2e         # Solo tests end-to-end
```

### Tests Específicos

```bash
# Tests individuales de base de datos
npm run test:connection  # Solo conexión MySQL
npm run test:models      # Solo modelos Sequelize

# Test específico de API
npm run test:api         # Solo endpoints de API
```

## 📊 Tipos de Tests

### 🗄️ **Database Tests**
- **Conexión**: Verifica conectividad con MySQL
- **Modelos**: Tests completos de Sequelize (CRUD, validaciones, relaciones)

**Cobertura**:
- ✅ Conexión y autenticación MySQL
- ✅ Sincronización de modelos
- ✅ Operaciones CRUD básicas
- ✅ Validaciones de campos
- ✅ Relaciones entre tablas
- ✅ Hash de contraseñas

### 🧪 **Unit Tests**
- **Modelo Docente**: Validaciones, métodos, permisos
- **Modelo Apoderado**: Gestión de hijos, notificaciones, contactos

**Cobertura**:
- ✅ Validación de RUT, email, teléfono
- ✅ Hash y verificación de contraseñas
- ✅ Métodos de instancia y estáticos
- ✅ Configuraciones por defecto
- ✅ Lógica de negocio específica

### 🔗 **Integration Tests**  
- **API Endpoints**: Pruebas de endpoints REST
- **Response Validation**: Verificación de respuestas JSON

**Cobertura**:
- ✅ Endpoints principales (/, /api/health)
- ✅ Status codes correctos
- ✅ Content-Type headers
- ✅ Manejo de errores (404, 500)
- ✅ Tiempo de respuesta
- ✅ CORS configurado

### 🎭 **End-to-End Tests**
- **Flujos Completos**: Casos de uso reales de la aplicación
- **Integridad de Datos**: Verificación de consistencia

**Cobertura**:
- ✅ Creación de docente → reporte → consulta API
- ✅ Creación de apoderado → contacto → relaciones
- ✅ Validaciones en cascada
- ✅ Performance básica y concurrencia
- ✅ Integridad referencial (FK constraints)

## 🛠️ Helpers y Utilidades

### **Config Helper** (`helpers/config.js`)
- Configuración global de tests
- Variables de entorno de test
- Logger con colores
- Datos de prueba reutilizables
- Funciones de limpieza de BD

### **Utils Helper** (`helpers/utils.js`)
- **HTTPTestHelper**: Cliente HTTP para tests de API
- **DatabaseTestHelper**: Utilidades para tests de BD
- **ValidationTestHelper**: Assertions personalizados
- **TestRunner**: Framework básico de tests

## 📋 Ejemplo de Uso

### Ejecutar todos los tests
```bash
npm test
```

**Salida esperada**:
```
🚀 INICIANDO SUITE COMPLETA DE TESTS
=====================================

🗄️ === TESTS DE BASE DATOS ===
✅ Test de conexión: PASSED
✅ Test de modelos: PASSED

🧪 === TESTS UNITARIOS ===  
✅ Modelo Docente: PASSED
✅ Modelo Apoderado: PASSED

🔗 === TESTS DE INTEGRACIÓN ===
✅ Tests de API: PASSED

🎭 === TESTS END-TO-END ===
✅ Tests E2E: PASSED

📊 REPORTE FINAL DE TESTS
============================================================
🗄️ Base de Datos: ✅ 2/2 (100.0%)
🧪 Unitarios: ✅ 2/2 (100.0%)  
🔗 Integración: ✅ 1/1 (100.0%)
🎭 End-to-End: ✅ 1/1 (100.0%)

🏆 RESUMEN GLOBAL: 6/6 tests (100.0%)
🎉 ¡TODOS LOS TESTS PASARON!
```

### Ejecutar solo tests unitarios
```bash
npm run test:unit
```

### Ejecutar test específico
```bash
node tests/unit/docente.test.js
```

## 🔧 Configuración de Test

### Variables de Entorno
```env
NODE_ENV=test
TEST_DB_NAME=agenda_escolar_test
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
```

### Base de Datos de Test
Los tests usan una estrategia de **limpieza automática**:
- Cada suite de tests crea/limpia sus propios datos
- Tests unitarios usan `syncModels(true)` para limpiar BD
- Tests E2E limpian datos específicos después de cada test
- No interfieren con datos de desarrollo

## 🐛 Debugging Tests

### Logs Detallados
Los tests incluyen logging detallado:
- `logger.info()` - Información general
- `logger.success()` - Tests exitosos  
- `logger.error()` - Errores y fallos
- `logger.debug()` - Información de debug
- `logger.warning()` - Advertencias

### Ejecutar Test Individual
```bash
# Con logs detallados
DEBUG=true node tests/unit/docente.test.js

# Solo el test específico
node tests/database/connection.test.js
```

## 📈 Métricas y Coverage

### Tests Incluidos
- **Total**: ~25+ tests individuales
- **Base de Datos**: 7 tests principales
- **Unitarios**: 12+ tests por modelo
- **Integración**: 10+ tests de API
- **E2E**: 5+ flujos completos

### Validaciones Cubiertas
- ✅ Validación de datos (RUT, email, teléfono)
- ✅ Seguridad (hash de contraseñas)
- ✅ Relaciones de base de datos
- ✅ Lógica de negocio
- ✅ Endpoints de API
- ✅ Manejo de errores
- ✅ Performance básica

## 🎯 Agregando Nuevos Tests

### 1. Test Unitario
```javascript
// tests/unit/nuevo-modelo.test.js
const { TestRunner, ValidationTestHelper } = require('../helpers/utils');

class NuevoModeloTests {
  constructor() {
    this.runner = new TestRunner('Nuevo Modelo');
  }
  
  defineTests() {
    this.runner.describe('Test description', async () => {
      // Test implementation
      ValidationTestHelper.assertTrue(condition, 'Message');
    });
  }
  
  async runTests() {
    this.defineTests();
    return await this.runner.run();
  }
}
```

### 2. Test de Integración
```javascript
// tests/integration/nuevo-endpoint.test.js
const { HTTPTestHelper, ValidationTestHelper } = require('../helpers/utils');

const response = await HTTPTestHelper.get('/api/nuevo-endpoint');
ValidationTestHelper.assertStatusCode(response, 200);
```

---

## 🏆 **Estado Actual**: ✅ **SUITE COMPLETA FUNCIONANDO**

Todos los tests están implementados y organizados. La suite proporciona cobertura completa de:
- Base de datos MySQL + Sequelize  
- Modelos y validaciones
- API endpoints
- Flujos end-to-end
- Utilidades reutilizables

**¡Lista para ejecutar `npm test` y verificar que todo funciona!** 🚀
