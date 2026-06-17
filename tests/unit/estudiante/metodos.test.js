/**
 * Tests de métodos del modelo Estudiante
 */

const { connect, disconnect, syncModels } = require('../../../database/connection');
const { initializeModels } = require('../../../models');
const { TestRunner, ValidationTestHelper } = require('../../helpers/utils');

class EstudianteMetodosTests {
  constructor() {
    this.runner = new TestRunner('Estudiante - Métodos');
    this.models = null;
    this.cursoPrueba = null;
  }

  async setup() {
    try {
      await connect();
      await syncModels(false);
      this.models = initializeModels();
      this.cursoPrueba = await this.models.Curso.create({
        nombre: 'Curso Metodos Test',
        nivel: '3° Básico'
      });
      console.log('✅ Setup completado para métodos de Estudiante');
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
      console.log('✅ Teardown completado para métodos de Estudiante');
    } catch (error) {
      console.error(`❌ Error en teardown: ${error.message}`);
    }
  }

  defineTests() {
    this.runner.describe('findByPk trae los datos correctos', async () => {
      const creado = await this.models.Estudiante.create({
        nombres: 'Buscar',
        apellidos: 'PorId',
        cursoId: this.cursoPrueba.id,
        edad: 8
      });

      const encontrado = await this.models.Estudiante.findByPk(creado.id);

      ValidationTestHelper.assertTrue(encontrado !== null, 'Debe encontrar el estudiante');
      ValidationTestHelper.assertEquals(encontrado.nombres, 'Buscar');
      ValidationTestHelper.assertEquals(encontrado.apellidos, 'PorId');
      ValidationTestHelper.assertEquals(encontrado.edad, 8);

      await creado.destroy();
    });

    this.runner.describe('findAll filtra por cursoId', async () => {
      const e1 = await this.models.Estudiante.create({ nombres: 'E1', apellidos: 'Filtro', cursoId: this.cursoPrueba.id });
      const e2 = await this.models.Estudiante.create({ nombres: 'E2', apellidos: 'Filtro', cursoId: this.cursoPrueba.id });

      const lista = await this.models.Estudiante.findAll({
        where: { cursoId: this.cursoPrueba.id }
      });

      ValidationTestHelper.assertTrue(lista.length >= 2, 'Debe retornar al menos los 2 creados');

      await e1.destroy();
      await e2.destroy();
    });

    this.runner.describe('update modifica nombre del estudiante', async () => {
      const estudiante = await this.models.Estudiante.create({
        nombres: 'Original',
        apellidos: 'Apellido',
        cursoId: this.cursoPrueba.id
      });

      await estudiante.update({ nombres: 'Modificado' });
      const actualizado = await this.models.Estudiante.findByPk(estudiante.id);

      ValidationTestHelper.assertEquals(actualizado.nombres, 'Modificado');
      await actualizado.destroy();
    });

    this.runner.describe('Relación N:M con Apoderado', async () => {
      const estudiante = await this.models.Estudiante.create({
        nombres: 'ConApoderado',
        apellidos: 'Relacion',
        cursoId: this.cursoPrueba.id
      });

      const apoderado = await this.models.Apoderado.create({
        rut: '29888777-6',
        nombres: 'Apo',
        apellidos: 'Prueba',
        parentesco: 'Madre',
        email: 'apo.metodos@test.com',
        password: 'test123456',
        telefono: '+56911000001'
      });

      await apoderado.addEstudiante(estudiante);

      const estudianteConApo = await this.models.Estudiante.findByPk(estudiante.id, {
        include: [{ model: this.models.Apoderado, as: 'apoderados' }]
      });

      ValidationTestHelper.assertTrue(
        estudianteConApo.apoderados.length === 1,
        'Estudiante debe tener 1 apoderado vinculado'
      );

      await this.models.ApoderadoEstudiante.destroy({
        where: { estudianteId: estudiante.id }
      });
      await apoderado.destroy();
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
  const tests = new EstudianteMetodosTests();
  tests.run()
    .then(resultado => process.exit(resultado.failed > 0 ? 1 : 0))
    .catch(error => {
      console.error('Error ejecutando tests:', error);
      process.exit(1);
    });
}

module.exports = EstudianteMetodosTests;
