/**
 * Tests unitarios para el modelo Docente
 */

const { connect, disconnect, syncModels } = require('../../database/connection');
const { initializeModels } = require('../../models');
const { logger, TEST_DATA, cleanTestDB } = require('../helpers/config');
const { TestRunner, ValidationTestHelper, DatabaseTestHelper } = require('../helpers/utils');

class DocenteModelTests {
  constructor() {
    this.models = null;
    this.runner = new TestRunner('Modelo Docente');
  }

  async setup() {
    try {
      await connect();
      await syncModels(true); // Limpiar y recrear tablas
      this.models = initializeModels();
      logger.success('Setup completado para tests de Docente');
    } catch (error) {
      logger.error(`Error en setup: ${error.message}`);
      throw error;
    }
  }

  async teardown() {
    try {
      await disconnect();
      logger.success('Teardown completado para tests de Docente');
    } catch (error) {
      logger.error(`Error en teardown: ${error.message}`);
    }
  }

  defineTests() {
    this.runner.describe('Crear docente válido', async () => {
      const docente = await this.models.Docente.create(TEST_DATA.DOCENTE);
      
      ValidationTestHelper.assertTrue(docente.id > 0, 'Docente debe tener ID');
      ValidationTestHelper.assertEquals(docente.nombre, TEST_DATA.DOCENTE.nombre);
      ValidationTestHelper.assertEquals(docente.email, TEST_DATA.DOCENTE.email.toLowerCase());
      ValidationTestHelper.assertTrue(docente.activo, 'Docente debe estar activo por defecto');
      
      await docente.destroy();
    });

    this.runner.describe('Validación de RUT', async () => {
      try {
        await this.models.Docente.create({
          ...TEST_DATA.DOCENTE,
          rut: 'rut-invalido'
        });
        throw new Error('Debería haber fallado la validación');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.message.includes('RUT inválido'),
          'Error debe mencionar RUT inválido'
        );
      }
    });

    this.runner.describe('Validación de email', async () => {
      try {
        await this.models.Docente.create({
          ...TEST_DATA.DOCENTE,
          email: 'email-invalido'
        });
        throw new Error('Debería haber fallado la validación');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.message.includes('email'),
          'Error debe mencionar email inválido'
        );
      }
    });

    this.runner.describe('Hash de contraseña', async () => {
      const docente = await this.models.Docente.create(TEST_DATA.DOCENTE);
      
      // Obtener con contraseña
      const docenteConPassword = await this.models.Docente.scope('withPassword').findByPk(docente.id);
      
      ValidationTestHelper.assertTrue(
        docenteConPassword.password !== TEST_DATA.DOCENTE.password,
        'Contraseña debe estar hasheada'
      );
      
      // Verificar método de comparación
      const isValid = await docenteConPassword.compararPassword(TEST_DATA.DOCENTE.password);
      ValidationTestHelper.assertTrue(isValid, 'Comparación de contraseña debe ser válida');
      
      await docente.destroy();
    });

    this.runner.describe('Métodos del modelo', async () => {
      const docente = await this.models.Docente.create({
        ...TEST_DATA.DOCENTE,
        esProfesorJefe: true
      });
      
      // Test definirPermisos
      const permisos = docente.definirPermisos();
      ValidationTestHelper.assertTrue(
        permisos.includes('gestionar_curso'),
        'Profesor jefe debe tener permiso de gestionar curso'
      );
      
      // Test puedeCrearReporteEnCurso
      const puedeCrear = docente.puedeCrearReporteEnCurso('TEST1A');
      ValidationTestHelper.assertTrue(puedeCrear, 'Docente debe poder crear reporte en su curso');
      
      // Test obtenerPerfilPublico
      const perfil = docente.obtenerPerfilPublico();
      ValidationTestHelper.assertTrue(
        !('password' in perfil),
        'Perfil público no debe incluir contraseña'
      );
      
      await docente.destroy();
    });

    this.runner.describe('Actualización de último acceso', async () => {
      const docente = await this.models.Docente.create(TEST_DATA.DOCENTE);
      
      ValidationTestHelper.assertTrue(
        !docente.fechaUltimoAcceso,
        'Fecha último acceso debe ser null inicialmente'
      );
      
      await docente.registrarAcceso();
      await docente.reload();
      
      ValidationTestHelper.assertTrue(
        docente.fechaUltimoAcceso instanceof Date,
        'Fecha último acceso debe ser válida después del registro'
      );
      
      await docente.destroy();
    });

    this.runner.describe('Validación de campos únicos', async () => {
      const docente1 = await this.models.Docente.create(TEST_DATA.DOCENTE);
      
      try {
        await this.models.Docente.create({
          ...TEST_DATA.DOCENTE,
          nombre: 'Otro Docente'
        });
        throw new Error('Debería haber fallado por RUT duplicado');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.message.includes('Duplicate') || error.message.includes('unique'),
          'Error debe mencionar duplicado'
        );
      }
      
      await docente1.destroy();
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
  const testSuite = new DocenteModelTests();
  testSuite.runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error(`Error ejecutando tests: ${error.message}`);
      process.exit(1);
    });
}

module.exports = DocenteModelTests;
