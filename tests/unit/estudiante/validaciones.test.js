/**
 * Tests de validaciones para el modelo Estudiante
 */

const { connect, disconnect, syncModels } = require('../../../database/connection');
const { initializeModels } = require('../../../models');
const { TestRunner, ValidationTestHelper } = require('../../helpers/utils');
const { TEST_DATA } = require('../../helpers/config');

class EstudianteValidationTests {
  constructor() {
    this.runner = new TestRunner('Estudiante - Validaciones');
    this.models = null;
    this.cursoPrueba = null;
  }

  async setup() {
    try {
      await connect();
      await syncModels(false);
      this.models = initializeModels();
      this.cursoPrueba = await this.models.Curso.create({
        nombre: 'Curso Validacion Test',
        nivel: '2° Básico'
      });
      console.log('✅ Setup completado para validaciones de Estudiante');
    } catch (error) {
      console.error(`❌ Error en setup: ${error.message}`);
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
      console.log('✅ Teardown completado para validaciones de Estudiante');
    } catch (error) {
      console.error(`❌ Error en teardown: ${error.message}`);
    }
  }

  defineTests() {
    this.runner.describe('nombres vacío rechazado', async () => {
      try {
        await this.models.Estudiante.create({
          nombres: '',
          apellidos: 'Test',
          cursoId: this.cursoPrueba.id
        });
        throw new Error('Debería haber fallado');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.name === 'SequelizeValidationError',
          'Error debe ser SequelizeValidationError'
        );
      }
    });

    this.runner.describe('apellidos vacío rechazado', async () => {
      try {
        await this.models.Estudiante.create({
          nombres: 'Test',
          apellidos: '',
          cursoId: this.cursoPrueba.id
        });
        throw new Error('Debería haber fallado');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.name === 'SequelizeValidationError',
          'Error debe ser SequelizeValidationError'
        );
      }
    });

    this.runner.describe('cursoId requerido', async () => {
      try {
        await this.models.Estudiante.create({
          nombres: 'Test',
          apellidos: 'SinCurso'
        });
        throw new Error('Debería haber fallado');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.name === 'SequelizeValidationError' ||
          error.name === 'SequelizeDatabaseError',
          'Error debe ser de validación o BD por FK nula'
        );
      }
    });

    this.runner.describe('fechaNacimiento acepta formato DATEONLY', async () => {
      const estudiante = await this.models.Estudiante.create({
        nombres: 'Fecha',
        apellidos: 'Valida',
        cursoId: this.cursoPrueba.id,
        fechaNacimiento: '2015-06-20'
      });

      ValidationTestHelper.assertTrue(
        estudiante.fechaNacimiento !== null,
        'fechaNacimiento debe guardarse'
      );
      await estudiante.destroy();
    });

    this.runner.describe('RUT null es válido (opcional)', async () => {
      const estudiante = await this.models.Estudiante.create({
        nombres: 'Sin',
        apellidos: 'Rut',
        cursoId: this.cursoPrueba.id,
        rut: null
      });

      ValidationTestHelper.assertTrue(
        estudiante.id > 0,
        'Debe crearse sin RUT'
      );
      await estudiante.destroy();
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

if (require.main === module) {
  const tests = new EstudianteValidationTests();
  tests.run()
    .then(resultado => process.exit(resultado.failed > 0 ? 1 : 0))
    .catch(error => {
      console.error('Error ejecutando tests:', error);
      process.exit(1);
    });
}

module.exports = EstudianteValidationTests;
