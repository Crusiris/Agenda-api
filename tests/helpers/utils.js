/**
 * Utilidades helper para tests
 * Funciones reutilizables para diferentes tipos de tests
 */

const http = require('http');
const { CONFIG, logger } = require('./config');

/**
 * Helper para hacer peticiones HTTP en tests
 */
class HTTPTestHelper {
  static async request(options = {}) {
    return new Promise((resolve, reject) => {
      const defaultOptions = {
        hostname: 'localhost',
        port: 3000,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const requestOptions = { ...defaultOptions, ...options };

      const req = http.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = data ? JSON.parse(data) : null;
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: jsonData,
              rawBody: data
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: null,
              rawBody: data,
              parseError: error
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(CONFIG.TIMEOUT, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (requestOptions.body) {
        req.write(typeof requestOptions.body === 'string' ? 
          requestOptions.body : JSON.stringify(requestOptions.body));
      }

      req.end();
    });
  }

  static async get(path) {
    return this.request({ path, method: 'GET' });
  }

  static async post(path, body) {
    return this.request({ 
      path, 
      method: 'POST', 
      body 
    });
  }

  static async put(path, body) {
    return this.request({ 
      path, 
      method: 'PUT', 
      body 
    });
  }

  static async delete(path) {
    return this.request({ 
      path, 
      method: 'DELETE' 
    });
  }
}

/**
 * Helper para tests de base de datos
 */
class DatabaseTestHelper {
  static async createTestData(models, data) {
    const created = {};
    
    try {
      // Crear en orden para respetar relaciones
      if (data.docente) {
        created.docente = await models.Docente.create(data.docente);
        logger.debug(`Docente creado: ID ${created.docente.id}`);
      }
      
      if (data.apoderado) {
        created.apoderado = await models.Apoderado.create(data.apoderado);
        logger.debug(`Apoderado creado: ID ${created.apoderado.id}`);
      }
      
      if (data.contacto && created.apoderado) {
        created.contacto = await models.Contacto.create({
          ...data.contacto,
          apoderadoId: created.apoderado.id
        });
        logger.debug(`Contacto creado: ID ${created.contacto.id}`);
      }
      
      if (data.reporte && created.docente) {
        created.reporte = await models.ReporteEscolar.create({
          ...data.reporte,
          docenteId: created.docente.id
        });
        logger.debug(`Reporte creado: ID ${created.reporte.id}`);
      }
      
      return created;
    } catch (error) {
      logger.error(`Error creando datos de test: ${error.message}`);
      throw error;
    }
  }

  static async cleanupTestData(models, created) {
    try {
      // Eliminar en orden inverso para respetar relaciones
      if (created.reporte) {
        await created.reporte.destroy();
        logger.debug('Reporte eliminado');
      }
      
      if (created.contacto) {
        await created.contacto.destroy();
        logger.debug('Contacto eliminado');
      }
      
      if (created.apoderado) {
        await created.apoderado.destroy();
        logger.debug('Apoderado eliminado');
      }
      
      if (created.docente) {
        await created.docente.destroy();
        logger.debug('Docente eliminado');
      }
    } catch (error) {
      logger.warning(`Error limpiando datos de test: ${error.message}`);
    }
  }
}

/**
 * Helper para validaciones
 */
class ValidationTestHelper {
  static assertStatusCode(response, expectedCode, message = '') {
    if (response.statusCode !== expectedCode) {
      throw new Error(`${message} Expected ${expectedCode}, got ${response.statusCode}`);
    }
  }

  static assertResponseBody(response, expectedFields = []) {
    if (!response.body) {
      throw new Error('Response body is empty');
    }

    for (const field of expectedFields) {
      if (!(field in response.body)) {
        throw new Error(`Missing field '${field}' in response body`);
      }
    }
  }

  static assertValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
  }

  static assertValidRUT(rut) {
    const rutRegex = /^\d{7,8}-[\dkK]$/;
    if (!rutRegex.test(rut)) {
      throw new Error(`Invalid RUT format: ${rut}`);
    }
  }

  static assertEquals(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`${message} Expected '${expected}', got '${actual}'`);
    }
  }

  static assertTrue(condition, message = '') {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }
}

/**
 * Runner de tests genérico
 */
class TestRunner {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
  }

  describe(description, testFunction) {
    this.tests.push({ description, testFunction });
  }

  async run() {
    logger.test(`🧪 Ejecutando suite: ${this.suiteName}`);
    console.log('='.repeat(50));

    for (const test of this.tests) {
      try {
        logger.info(`Ejecutando: ${test.description}`);
        await test.testFunction();
        logger.success(`PASSED: ${test.description}`);
        this.passed++;
      } catch (error) {
        logger.error(`FAILED: ${test.description}`);
        logger.error(`Error: ${error.message}`);
        this.failed++;
      }
    }

    this.printSummary();
    return this.failed === 0;
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    logger.test('📊 Resumen de Tests:');
    logger.success(`✅ Pasaron: ${this.passed}`);
    
    if (this.failed > 0) {
      logger.error(`❌ Fallaron: ${this.failed}`);
    }
    
    if (this.skipped > 0) {
      logger.warning(`⏭️ Saltados: ${this.skipped}`);
    }

    const total = this.passed + this.failed + this.skipped;
    const percentage = total > 0 ? ((this.passed / total) * 100).toFixed(2) : 0;
    
    logger.info(`📈 Éxito: ${percentage}%`);

    if (this.failed === 0) {
      logger.success('🎉 ¡Todos los tests pasaron!');
    }
  }
}

module.exports = {
  HTTPTestHelper,
  DatabaseTestHelper,
  ValidationTestHelper,
  TestRunner
};
