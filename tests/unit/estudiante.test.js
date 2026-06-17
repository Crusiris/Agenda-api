/**
 * Tests unitarios para el modelo Estudiante
 */

const { connect, disconnect, syncModels } = require('../../database/connection');
const { initializeModels } = require('../../models');
const { logger, TEST_DATA } = require('../helpers/config');
const { TestRunner, ValidationTestHelper } = require('../helpers/utils');

class EstudianteModelTests {
  constructor() {
    this.models = null;
    this.runner = new TestRunner('Modelo Estudiante');
    this.cursoPrueba = null;
  }

  async setup() {
    try {
      await connect();
      await syncModels(false);
      this.models = initializeModels();
      // Crear curso de prueba necesario para los estudiantes
      this.cursoPrueba = await this.models.Curso.create(TEST_DATA.CURSO);
      logger.success('Setup completado para tests de Estudiante');
    } catch (error) {
      logger.error(`Error en setup: ${error.message}`);
      throw error;
    }
  }

  async teardown() {
    try {
      if (this.cursoPrueba) {
        await this.models.Estudiante.destroy({ where: { cursoId: this.cursoPrueba.id } });
        await this.cursoPrueba.destroy();
      }
      await disconnect();
      logger.success('Teardown completado para tests de Estudiante');
    } catch (error) {
      logger.error(`Error en teardown: ${error.message}`);
    }
  }

  defineTests() {
    this.runner.describe('Crear estudiante válido', async () => {
      const estudiante = await this.models.Estudiante.create({
        ...TEST_DATA.ESTUDIANTE,
        cursoId: this.cursoPrueba.id
      });

      ValidationTestHelper.assertTrue(estudiante.id > 0, 'Estudiante debe tener ID');
      ValidationTestHelper.assertEquals(estudiante.nombres, TEST_DATA.ESTUDIANTE.nombres);
      ValidationTestHelper.assertEquals(estudiante.apellidos, TEST_DATA.ESTUDIANTE.apellidos);
      ValidationTestHelper.assertEquals(estudiante.cursoId, this.cursoPrueba.id);
      ValidationTestHelper.assertTrue(estudiante.activo, 'Estudiante debe estar activo por defecto');

      await estudiante.destroy();
    });

    this.runner.describe('Campos obligatorios — nombres requerido', async () => {
      try {
        await this.models.Estudiante.create({
          apellidos: 'López',
          cursoId: this.cursoPrueba.id
        });
        throw new Error('Debería haber fallado la validación');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.name === 'SequelizeValidationError' || error.message.includes('obligatori'),
          'Error debe ser de validación por nombres faltante'
        );
      }
    });

    this.runner.describe('Campos obligatorios — apellidos requerido', async () => {
      try {
        await this.models.Estudiante.create({
          nombres: 'Test',
          cursoId: this.cursoPrueba.id
        });
        throw new Error('Debería haber fallado la validación');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.name === 'SequelizeValidationError' || error.message.includes('obligatori'),
          'Error debe ser de validación por apellidos faltante'
        );
      }
    });

    this.runner.describe('RUT único — no se puede repetir', async () => {
      const primero = await this.models.Estudiante.create({
        ...TEST_DATA.ESTUDIANTE,
        rut: '29999999-9',
        cursoId: this.cursoPrueba.id
      });

      try {
        await this.models.Estudiante.create({
          ...TEST_DATA.ESTUDIANTE,
          rut: '29999999-9',
          cursoId: this.cursoPrueba.id
        });
        throw new Error('Debería haber fallado por RUT duplicado');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.name === 'SequelizeUniqueConstraintError',
          'Error debe ser de restricción única'
        );
      } finally {
        await primero.destroy();
      }
    });

    this.runner.describe('Activo por defecto', async () => {
      const estudiante = await this.models.Estudiante.create({
        nombres: 'Estado',
        apellidos: 'Defecto',
        cursoId: this.cursoPrueba.id
      });

      ValidationTestHelper.assertTrue(estudiante.activo === true, 'activo debe ser true por defecto');
      await estudiante.destroy();
    });

    this.runner.describe('Asociación con Curso', async () => {
      const estudiante = await this.models.Estudiante.create({
        nombres: 'Con',
        apellidos: 'Curso',
        cursoId: this.cursoPrueba.id
      });

      const estudianteConCurso = await this.models.Estudiante.findByPk(estudiante.id, {
        include: [{ model: this.models.Curso, as: 'curso' }]
      });

      ValidationTestHelper.assertTrue(estudianteConCurso.curso !== null, 'Debe traer el curso asociado');
      ValidationTestHelper.assertEquals(estudianteConCurso.curso.id, this.cursoPrueba.id);
      await estudiante.destroy();
    });

    this.runner.describe('Soft delete — desactivar', async () => {
      const estudiante = await this.models.Estudiante.create({
        nombres: 'Para',
        apellidos: 'Desactivar',
        cursoId: this.cursoPrueba.id
      });

      await estudiante.update({ activo: false });
      const actualizado = await this.models.Estudiante.findByPk(estudiante.id);

      ValidationTestHelper.assertTrue(actualizado.activo === false, 'Estudiante debe quedar inactivo');
      await actualizado.destroy();
    });
  }

  async run() {
    await this.setup();
    this.defineTests();
    const resultado = await this.runner.run();
    await this.teardown();
    return resultado;
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  const tests = new EstudianteModelTests();
  tests.run()
    .then(resultado => {
      process.exit(resultado.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Error ejecutando tests:', error);
      process.exit(1);
    });
}

module.exports = EstudianteModelTests;
