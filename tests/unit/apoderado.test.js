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
      await syncModels(true);
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
      ValidationTestHelper.assertEquals(apoderado.nombre, TEST_DATA.APODERADO.nombre);
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

    this.runner.describe('Configuración de notificaciones por defecto', async () => {
      const apoderado = await this.models.Apoderado.create(TEST_DATA.APODERADO);
      
      ValidationTestHelper.assertTrue(
        apoderado.configuracionNotificaciones,
        'Debe tener configuración de notificaciones'
      );
      
      ValidationTestHelper.assertTrue(
        apoderado.configuracionNotificaciones.emailHabilitado,
        'Email debe estar habilitado por defecto'
      );
      
      await apoderado.destroy();
    });

    this.runner.describe('Gestión de hijos', async () => {
      const apoderado = await this.models.Apoderado.create(TEST_DATA.APODERADO);
      
      // Verificar hijo inicial
      ValidationTestHelper.assertTrue(
        Array.isArray(apoderado.hijos),
        'Hijos debe ser un array'
      );
      ValidationTestHelper.assertTrue(
        apoderado.hijos.length > 0,
        'Debe tener al menos un hijo'
      );
      
      // Agregar hijo
      const nuevoHijo = {
        nombre: 'Nuevo Hijo',
        rut: '22222222-2',
        curso: 'TEST2A',
        edad: 9
      };
      
      await apoderado.agregarHijo(nuevoHijo);
      await apoderado.reload();
      
      ValidationTestHelper.assertEquals(
        apoderado.hijos.length, 
        TEST_DATA.APODERADO.hijos.length + 1,
        'Debe tener un hijo más'
      );
      
      // Remover hijo
      await apoderado.removerHijo('22222222-2');
      await apoderado.reload();
      
      ValidationTestHelper.assertEquals(
        apoderado.hijos.length,
        TEST_DATA.APODERADO.hijos.length,
        'Debe volver al número original de hijos'
      );
      
      await apoderado.destroy();
    });

    this.runner.describe('Actualización de configuración de notificaciones', async () => {
      const apoderado = await this.models.Apoderado.create(TEST_DATA.APODERADO);
      
      const nuevaConfig = {
        emailHabilitado: false,
        smsHabilitado: true
      };
      
      await apoderado.actualizarConfiguracionNotificaciones(nuevaConfig);
      await apoderado.reload();
      
      ValidationTestHelper.assertEquals(
        apoderado.configuracionNotificaciones.emailHabilitado,
        false,
        'Email debe estar deshabilitado'
      );
      
      ValidationTestHelper.assertEquals(
        apoderado.configuracionNotificaciones.smsHabilitado,
        true,
        'SMS debe estar habilitado'
      );
      
      await apoderado.destroy();
    });

    this.runner.describe('Verificación de horarios de notificación', async () => {
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        configuracionNotificaciones: {
          ...TEST_DATA.APODERADO.configuracionNotificaciones,
          horarioNotificaciones: {
            inicio: '08:00',
            fin: '20:00'
          }
        }
      });
      
      // Simplemente verificar que el método existe y funciona
      const puedeRecibir = apoderado.puedeRecibirNotificacion('reporteSalud');
      ValidationTestHelper.assertTrue(
        typeof puedeRecibir === 'boolean',
        'Debe retornar un valor booleano'
      );
      
      await apoderado.destroy();
    });

    this.runner.describe('Perfil público', async () => {
      const apoderado = await this.models.Apoderado.create(TEST_DATA.APODERADO);
      
      const perfil = apoderado.obtenerPerfilPublico();
      
      ValidationTestHelper.assertTrue(
        !('password' in perfil),
        'Perfil público no debe incluir contraseña'
      );
      
      ValidationTestHelper.assertTrue(
        'nombre' in perfil && 'email' in perfil,
        'Perfil debe incluir información básica'
      );
      
      await apoderado.destroy();
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
