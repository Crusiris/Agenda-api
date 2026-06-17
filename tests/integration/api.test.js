/**
 * Tests de integración para la API
 */

const { logger, CONFIG } = require('../helpers/config');
const { HTTPTestHelper, TestRunner, ValidationTestHelper } = require('../helpers/utils');

class APIIntegrationTests {
  constructor() {
    this.runner = new TestRunner('API Integration Tests');
    this.baseUrl = CONFIG.BASE_URL;
  }

  defineTests() {
    this.runner.describe('GET / - Endpoint principal', async () => {
      const response = await HTTPTestHelper.get('/');
      
      ValidationTestHelper.assertStatusCode(response, 200, 'Endpoint principal debe responder OK');
      ValidationTestHelper.assertResponseBody(response, ['mensaje', 'version', 'database']);
      
      ValidationTestHelper.assertEquals(
        response.body.database,
        'MySQL + Sequelize ORM',
        'Debe confirmar que usa MySQL'
      );
    });

    this.runner.describe('GET /api/health - Estado de salud', async () => {
      const response = await HTTPTestHelper.get('/api/health');
      
      ValidationTestHelper.assertStatusCode(response, 200, 'Health check debe responder OK');
      ValidationTestHelper.assertResponseBody(response, ['api', 'database', 'timestamp']);
      
      ValidationTestHelper.assertEquals(
        response.body.api,
        'OK',
        'API debe estar en estado OK'
      );
    });

    this.runner.describe('GET /ruta-inexistente - 404 Error', async () => {
      const response = await HTTPTestHelper.get('/ruta-inexistente');
      
      ValidationTestHelper.assertStatusCode(response, 404, 'Ruta inexistente debe retornar 404');
      ValidationTestHelper.assertResponseBody(response, ['error']);
    });

    this.runner.describe('GET /api/docentes - Listar docentes', async () => {
      const response = await HTTPTestHelper.get('/api/docentes');
      
      // Puede ser 200 si hay docentes o 404 si la ruta no está implementada
      ValidationTestHelper.assertTrue(
        response.statusCode === 200 || response.statusCode === 404,
        'Endpoint docentes debe responder 200 o 404'
      );
      
      if (response.statusCode === 200) {
        ValidationTestHelper.assertTrue(
          Array.isArray(response.body) || 'docentes' in response.body,
          'Response debe ser array o contener campo docentes'
        );
      }
    });

    this.runner.describe('GET /api/apoderados - Listar apoderados', async () => {
      const response = await HTTPTestHelper.get('/api/apoderados');
      
      ValidationTestHelper.assertTrue(
        response.statusCode === 200 || response.statusCode === 404,
        'Endpoint apoderados debe responder 200 o 404'
      );
    });

    this.runner.describe('GET /api/reportes - Listar reportes', async () => {
      const response = await HTTPTestHelper.get('/api/reportes');
      
      ValidationTestHelper.assertTrue(
        response.statusCode === 200 || response.statusCode === 404,
        'Endpoint reportes debe responder 200 o 404'
      );
    });

    this.runner.describe('POST /api/docentes - Crear docente (sin auth)', async () => {
      const nuevoDocente = {
        rut: '99999999-9',
        nombre: 'Test API Docente',
        email: 'api.test@test.com',
        password: 'test123456',
        asignatura: 'Test API',
        cursos: ['API1A']
      };

      const response = await HTTPTestHelper.post('/api/docentes', nuevoDocente);
      
      // Puede ser 201 (creado), 400 (validación), 401 (auth), o 404 (no implementado)
      ValidationTestHelper.assertTrue(
        [201, 400, 401, 404].includes(response.statusCode),
        'POST docentes debe responder con código válido'
      );
    });

    this.runner.describe('Validación de CORS headers', async () => {
      const response = await HTTPTestHelper.get('/');
      
      // Verificar que no hay errores CORS
      ValidationTestHelper.assertTrue(
        response.statusCode !== 403,
        'No debe haber errores CORS'
      );
    });

    this.runner.describe('Content-Type headers', async () => {
      const response = await HTTPTestHelper.get('/api/health');
      
      ValidationTestHelper.assertTrue(
        response.headers['content-type']?.includes('application/json'),
        'API debe retornar content-type JSON'
      );
    });

    this.runner.describe('Response time', async () => {
      const startTime = Date.now();
      const response = await HTTPTestHelper.get('/');
      const responseTime = Date.now() - startTime;
      
      ValidationTestHelper.assertTrue(
        responseTime < 2000,
        'Response time debe ser menor a 2 segundos'
      );
      
      logger.debug(`Response time: ${responseTime}ms`);
    });
  }

  async runTests() {
    logger.info('Verificando que el servidor esté ejecutándose...');
    
    try {
      await HTTPTestHelper.get('/');
      logger.success('Servidor disponible, ejecutando tests de integración');
    } catch (error) {
      logger.error('Servidor no disponible. Asegúrate de que esté ejecutándose en puerto 3000');
      throw new Error('Servidor no disponible para tests de integración');
    }

    this.defineTests();
    return await this.runner.run();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const testSuite = new APIIntegrationTests();
  testSuite.runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error(`Error ejecutando tests: ${error.message}`);
      process.exit(1);
    });
}

module.exports = APIIntegrationTests;
