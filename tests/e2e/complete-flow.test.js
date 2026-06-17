/**
 * Tests End-to-End (E2E) - Flujo completo de la aplicación
 */

const { connect, disconnect, syncModels } = require('../../database/connection');
const { initializeModels } = require('../../models');
const { logger, TEST_DATA } = require('../helpers/config');
const { HTTPTestHelper, TestRunner, ValidationTestHelper, DatabaseTestHelper } = require('../helpers/utils');

class E2ETests {
  constructor() {
    this.models = null;
    this.runner = new TestRunner('End-to-End Tests');
    this.createdData = {};
  }

  async setup() {
    try {
      await connect();
      await syncModels(true);
      this.models = initializeModels();
      logger.success('Setup completado para tests E2E');
    } catch (error) {
      logger.error(`Error en setup: ${error.message}`);
      throw error;
    }
  }

  async teardown() {
    try {
      await DatabaseTestHelper.cleanupTestData(this.models, this.createdData);
      await disconnect();
      logger.success('Teardown completado para tests E2E');
    } catch (error) {
      logger.error(`Error en teardown: ${error.message}`);
    }
  }

  defineTests() {
    this.runner.describe('Flujo completo: Crear docente y reporte', async () => {
      // 1. Crear docente en BD
      const docente = await this.models.Docente.create(TEST_DATA.DOCENTE);
      this.createdData.docente = docente;
      
      ValidationTestHelper.assertTrue(docente.id > 0, 'Docente creado en BD');
      logger.debug(`Docente creado: ${docente.nombre} (ID: ${docente.id})`);
      
      // 2. Verificar que el docente aparece en la API (si está implementada)
      try {
        const response = await HTTPTestHelper.get('/api/docentes');
        if (response.statusCode === 200) {
          logger.debug('API de docentes disponible y respondiendo');
        }
      } catch (error) {
        logger.warning('API de docentes no disponible');
      }
      
      // 3. Crear reporte asociado al docente
      const reporte = await this.models.ReporteEscolar.create({
        ...TEST_DATA.REPORTE,
        docenteId: docente.id
      });
      this.createdData.reporte = reporte;
      
      ValidationTestHelper.assertTrue(reporte.id > 0, 'Reporte creado en BD');
      ValidationTestHelper.assertEquals(reporte.docenteId, docente.id, 'Reporte asociado al docente');
      logger.debug(`Reporte creado: ${reporte.tipo} (ID: ${reporte.id})`);
      
      // 4. Verificar relación docente -> reporte
      const docenteConReportes = await this.models.Docente.findByPk(docente.id, {
        include: [{ model: this.models.ReporteEscolar, as: 'reportes' }]
      });
      
      ValidationTestHelper.assertTrue(
        docenteConReportes.reportes.length > 0,
        'Docente debe tener reportes asociados'
      );
    });

    this.runner.describe('Flujo completo: Apoderado y contactos', async () => {
      // 1. Crear apoderado
      const apoderado = await this.models.Apoderado.create(TEST_DATA.APODERADO);
      this.createdData.apoderado = apoderado;
      
      ValidationTestHelper.assertTrue(apoderado.id > 0, 'Apoderado creado en BD');
      logger.debug(`Apoderado creado: ${apoderado.nombre} (ID: ${apoderado.id})`);
      
      // 2. Crear contacto asociado
      const contacto = await this.models.Contacto.create({
        ...TEST_DATA.CONTACTO,
        apoderadoId: apoderado.id
      });
      this.createdData.contacto = contacto;
      
      ValidationTestHelper.assertTrue(contacto.id > 0, 'Contacto creado en BD');
      ValidationTestHelper.assertEquals(contacto.apoderadoId, apoderado.id, 'Contacto asociado al apoderado');
      
      // 3. Verificar relación apoderado -> contactos
      const apoderadoConContactos = await this.models.Apoderado.findByPk(apoderado.id, {
        include: [{ model: this.models.Contacto, as: 'contactos' }]
      });
      
      ValidationTestHelper.assertTrue(
        apoderadoConContactos.contactos.length > 0,
        'Apoderado debe tener contactos asociados'
      );
    });

    this.runner.describe('Flujo de validaciones completo', async () => {
      // Test de validaciones en cascada
      
      // 1. Intentar crear docente con datos inválidos
      try {
        await this.models.Docente.create({
          rut: 'invalido',
          nombre: '',
          email: 'email-malo',
          password: '123',
          asignatura: ''
        });
        throw new Error('Debería haber fallado las validaciones');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.name === 'SequelizeValidationError',
          'Debe ser error de validación de Sequelize'
        );
        logger.debug('Validaciones de docente funcionando correctamente');
      }
      
      // 2. Intentar crear reporte sin docente válido
      try {
        await this.models.ReporteEscolar.create({
          tipo: 'asistencia',
          curso: 'TEST1A',
          docenteId: 99999, // ID inexistente
          contenido: {}
        });
        throw new Error('Debería haber fallado por FK inexistente');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.name.includes('Foreign') || error.name.includes('Constraint'),
          'Debe ser error de Foreign Key'
        );
        logger.debug('Validaciones de FK funcionando correctamente');
      }
    });

    this.runner.describe('Performance y concurrencia básica', async () => {
      // Test de creación múltiple simultánea
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          this.models.Docente.create({
            ...TEST_DATA.DOCENTE,
            rut: `1234567${i}-9`,
            email: `test${i}@test.com`
          })
        );
      }
      
      const docentes = await Promise.all(promises);
      const endTime = Date.now();
      
      ValidationTestHelper.assertEquals(docentes.length, 5, 'Deben crearse 5 docentes');
      ValidationTestHelper.assertTrue(
        endTime - startTime < 5000,
        'Creación múltiple debe completarse en menos de 5 segundos'
      );
      
      logger.debug(`Creación de 5 docentes tomó: ${endTime - startTime}ms`);
      
      // Limpiar docentes creados
      for (const docente of docentes) {
        await docente.destroy();
      }
    });

    this.runner.describe('Integridad de datos después de operaciones', async () => {
      // Crear datos relacionados
      const docente = await this.models.Docente.create({
        ...TEST_DATA.DOCENTE,
        rut: '88888888-8',
        email: 'integrity@test.com'
      });
      
      const reporte1 = await this.models.ReporteEscolar.create({
        ...TEST_DATA.REPORTE,
        docenteId: docente.id,
        tipo: 'asistencia'
      });
      
      const reporte2 = await this.models.ReporteEscolar.create({
        ...TEST_DATA.REPORTE,
        docenteId: docente.id,
        tipo: 'aviso-diario'
      });
      
      // Verificar conteo de reportes
      const countReportes = await this.models.ReporteEscolar.count({
        where: { docenteId: docente.id }
      });
      
      ValidationTestHelper.assertEquals(countReportes, 2, 'Debe haber 2 reportes');
      
      // Eliminar docente (debe eliminar reportes por CASCADE)
      await docente.destroy();
      
      // Verificar que reportes fueron eliminados
      const reportesRestantes = await this.models.ReporteEscolar.count({
        where: { docenteId: docente.id }
      });
      
      ValidationTestHelper.assertEquals(
        reportesRestantes, 
        0, 
        'Reportes deben ser eliminados por CASCADE'
      );
    });
  }

  async runTests() {
    logger.info('Verificando disponibilidad del servidor para tests E2E...');
    
    try {
      const response = await HTTPTestHelper.get('/api/health');
      if (response.statusCode === 200) {
        logger.success('Servidor disponible para tests E2E');
      }
    } catch (error) {
      logger.warning('Servidor no disponible, ejecutando solo tests de BD');
    }

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
  const testSuite = new E2ETests();
  testSuite.runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error(`Error ejecutando tests E2E: ${error.message}`);
      process.exit(1);
    });
}

module.exports = E2ETests;
