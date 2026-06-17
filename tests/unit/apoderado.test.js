/**
 * Tests unitarios para el modelo Apoderado
 */

const { connect, disconnect, syncModels } = require('../../database/connection');
const { initializeModels } = require('../../models');
const { logger, TEST_DATA } = require('../helpers/config');
const { TestRunner, ValidationTestHelper } = require('../helpers/utils');

class ApoderadoModelTests {
  constructor() {
    this.models = null;
    this.runner = new TestRunner('Modelo Apoderado');
  }

  async setup() {
    try {
      await connect();
      await syncModels(false);
      this.models = initializeModels();
      logger.success('Setup completado para tests de Apoderado');
    } catch (error) {
      logger.error(`Error en setup: ${error.message}`);
      throw error;
    }
  }

  async teardown() {
    try {
      await disconnect();
      logger.success('Teardown completado para tests de Apoderado');
    } catch (error) {
      logger.error(`Error en teardown: ${error.message}`);
    }
  }

  defineTests() {
    this.runner.describe('Crear apoderado válido', async () => {
      const apoderado = await this.models.Apoderado.create(TEST_DATA.APODERADO);
      
      ValidationTestHelper.assertTrue(apoderado.id > 0, 'Apoderado debe tener ID');
      ValidationTestHelper.assertEquals(apoderado.nombres, TEST_DATA.APODERADO.nombres);
      ValidationTestHelper.assertEquals(apoderado.email, TEST_DATA.APODERADO.email.toLowerCase());
      ValidationTestHelper.assertTrue(apoderado.activo, 'Apoderado debe estar activo por defecto');
      
      await apoderado.destroy();
    });

    this.runner.describe('Validación de teléfono', async () => {
      try {
        await this.models.Apoderado.create({
          ...TEST_DATA.APODERADO,
          telefono: 'telefono-invalido'
        });
        throw new Error('Debería haber fallado la validación');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.message.includes('teléfono') || error.message.includes('phone'),
          'Error debe mencionar teléfono inválido'
        );
      }
    });

    this.runner.describe('Notificaciones habilitadas por defecto', async () => {
      const apoderado = await this.models.Apoderado.create(TEST_DATA.APODERADO);
      
      ValidationTestHelper.assertTrue(
        apoderado.configuracionesNotificaciones === true,
        'Notificaciones deben estar habilitadas por defecto'
      );
      
      await apoderado.destroy();
    });

    this.runner.describe('puedeRecibirNotificacion cuando activo=true', async () => {
      const apoderado = await this.models.Apoderado.create(TEST_DATA.APODERADO);
      
      ValidationTestHelper.assertTrue(
        apoderado.puedeRecibirNotificacion(),
        'Apoderado activo debe poder recibir notificaciones'
      );
      
      await apoderado.destroy();
    });

    this.runner.describe('puedeRecibirNotificacion cuando activo=false', async () => {
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        email: 'test.inactivo@test.com',
        activo: false
      });
      
      ValidationTestHelper.assertTrue(
        !apoderado.puedeRecibirNotificacion(),
        'Apoderado inactivo no debe poder recibir notificaciones'
      );
      
      await apoderado.destroy();
    });

    this.runner.describe('registrarAcceso actualiza fechaUltimoAcceso', async () => {
      const apoderado = await this.models.Apoderado.create(TEST_DATA.APODERADO);
      
      ValidationTestHelper.assertTrue(
        !apoderado.fechaUltimoAcceso,
        'Fecha último acceso debe ser null inicialmente'
      );
      
      await apoderado.registrarAcceso();
      await apoderado.reload();
      
      ValidationTestHelper.assertTrue(
        apoderado.fechaUltimoAcceso instanceof Date,
        'Fecha último acceso debe ser válida después del registro'
      );
      
      await apoderado.destroy();
    });

    this.runner.describe('Perfil público no incluye contraseña', async () => {
      const apoderado = await this.models.Apoderado.create(TEST_DATA.APODERADO);
      
      const perfil = apoderado.obtenerPerfilPublico();
      
      ValidationTestHelper.assertTrue(
        !('password' in perfil),
        'Perfil público no debe incluir contraseña'
      );
      ValidationTestHelper.assertTrue(
        'nombres' in perfil && 'email' in perfil,
        'Perfil debe incluir nombres y email'
      );
      
      await apoderado.destroy();
    });

    this.runner.describe('validarCredenciales rechaza datos inválidos', async () => {
      const errores = this.models.Apoderado.validarCredenciales('no-es-email', '123');
      
      ValidationTestHelper.assertTrue(
        errores.length > 0,
        'Debe retornar errores para credenciales inválidas'
      );
    });
  }

  async runTests() {
    try {
      await this.setup();
      this.defineTests();
      const success = await this.runner.run();
      return success;
    } finally {
      await this.teardown();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const testSuite = new ApoderadoModelTests();
  testSuite.runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error(`Error ejecutando tests: ${error.message}`);
      process.exit(1);
    });
}

module.exports = ApoderadoModelTests;
