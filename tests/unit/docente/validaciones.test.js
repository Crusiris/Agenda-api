/**
 * 🧪 Tests Unitarios - Modelo Docente - Validaciones
 * 
 * Tests específicos para validaciones del modelo Docente:
 * - Validación de RUT
 * - Validación de email
 * - Validación de contraseña
 * - Validaciones de campos obligatorios
 */

const { connect, disconnect } = require('../../../database/connection');
const { initializeModels } = require('../../../database/inicializarDatos');
const ValidationTestHelper = require('../../helpers/utils').ValidationTestHelper;
const TestRunner = require('../../helpers/utils').TestRunner;
const { TEST_DATA } = require('../../helpers/config');

class DocenteValidationTests {
  constructor() {
    this.runner = new TestRunner('Docente - Validaciones');
    this.models = null;
  }

  async setup() {
    try {
      await connect();
      this.models = initializeModels();
      console.log('✅ Setup completado para tests de validaciones Docente');
    } catch (error) {
      console.error(`❌ Error en setup: ${error.message}`);
      throw error;
    }
  }

  async teardown() {
    try {
      // Limpiar datos de test
      await this.models.Docente.destroy({
        where: {
          email: {
            [require('sequelize').Op.like]: '%test%'
          }
        }
      });
      await disconnect();
      console.log('✅ Teardown completado para tests de validaciones Docente');
    } catch (error) {
      console.error(`❌ Error en teardown: ${error.message}`);
    }
  }

  defineTests() {
    // Test 1: Validación de RUT correcto
    this.runner.describe('Validación de RUT correcto', async () => {
      const docente = await this.models.Docente.create({
        ...TEST_DATA.DOCENTE,
        email: 'test.rut.valido@test.com'
      });
      
      ValidationTestHelper.assertTrue(docente.id > 0, 'Docente con RUT válido debe crearse');
      ValidationTestHelper.assertEquals(docente.rut, TEST_DATA.DOCENTE.rut);
      
      await docente.destroy();
    });

    // Test 2: Validación de RUT inválido
    this.runner.describe('Validación de RUT inválido', async () => {
      const rutesInvalidos = [
        '12345678',     // Sin dígito verificador
        '123456789',    // Muy largo
        '1234567-X',    // Dígito verificador inválido
        'abc12345-6',   // Contiene letras
        '12-345-678-9', // Formato incorrecto
        ''              // Vacío
      ];

      for (const rutInvalido of rutesInvalidos) {
        try {
          await this.models.Docente.create({
            ...TEST_DATA.DOCENTE,
            rut: rutInvalido,
            email: `test.rut.${Date.now()}@test.com`
          });
          
          throw new Error(`RUT ${rutInvalido} debería haber sido rechazado`);
        } catch (error) {
          ValidationTestHelper.assertTrue(
            error.message.includes('RUT') || error.message.includes('Validation'),
            `Error correcto para RUT inválido: ${rutInvalido}`
          );
        }
      }
    });

    // Test 3: Validación de email correcto
    this.runner.describe('Validación de email correcto', async () => {
      const emailsValidos = [
        'docente@colegio.cl',
        'profesor.matematicas@escuela.edu',
        'maria.gonzalez+teacher@gmail.com'
      ];

      for (const emailValido of emailsValidos) {
        const docente = await this.models.Docente.create({
          ...TEST_DATA.DOCENTE,
          rut: `${Math.floor(Math.random() * 10000000) + 10000000}-9`,
          email: emailValido
        });
        
        ValidationTestHelper.assertTrue(docente.id > 0, `Email válido debe aceptarse: ${emailValido}`);
        ValidationTestHelper.assertEquals(docente.email, emailValido.toLowerCase());
        
        await docente.destroy();
      }
    });

    // Test 4: Validación de email inválido
    this.runner.describe('Validación de email inválido', async () => {
      const emailsInvalidos = [
        'email-sin-arroba.com',
        '@dominio-sin-usuario.com',
        'usuario@',
        'email con espacios@domain.com',
        'email..doble.punto@domain.com',
        ''
      ];

      for (const emailInvalido of emailsInvalidos) {
        try {
          await this.models.Docente.create({
            ...TEST_DATA.DOCENTE,
            rut: `${Math.floor(Math.random() * 10000000) + 10000000}-K`,
            email: emailInvalido
          });
          
          throw new Error(`Email ${emailInvalido} debería haber sido rechazado`);
        } catch (error) {
          ValidationTestHelper.assertTrue(
            error.message.includes('email') || error.message.includes('Validation'),
            `Error correcto para email inválido: ${emailInvalido}`
          );
        }
      }
    });

    // Test 5: Validación de contraseña
    this.runner.describe('Validación de contraseña', async () => {
      const passwordsInvalidos = [
        '',       // Vacío
        '123',    // Muy corto
        '12345'   // Menos de 6 caracteres
      ];

      for (const passwordInvalido of passwordsInvalidos) {
        try {
          await this.models.Docente.create({
            ...TEST_DATA.DOCENTE,
            rut: `${Math.floor(Math.random() * 10000000) + 10000000}-1`,
            email: `test.pass.${Date.now()}@test.com`,
            password: passwordInvalido
          });
          
          throw new Error(`Password ${passwordInvalido} debería haber sido rechazado`);
        } catch (error) {
          ValidationTestHelper.assertTrue(
            error.message.includes('contraseña') || error.message.includes('password') || error.message.includes('Validation'),
            `Error correcto para password inválido: ${passwordInvalido}`
          );
        }
      }
    });

    // Test 6: Campos obligatorios
    this.runner.describe('Validación de campos obligatorios', async () => {
      const camposObligatorios = ['rut', 'nombre', 'email', 'password', 'asignatura'];
      
      for (const campo of camposObligatorios) {
        try {
          const datosIncompletos = { ...TEST_DATA.DOCENTE };
          delete datosIncompletos[campo];
          datosIncompletos.email = `test.obligatorio.${Date.now()}@test.com`;
          datosIncompletos.rut = `${Math.floor(Math.random() * 10000000) + 10000000}-2`;
          
          await this.models.Docente.create(datosIncompletos);
          
          throw new Error(`Campo ${campo} debería ser obligatorio`);
        } catch (error) {
          ValidationTestHelper.assertTrue(
            error.message.includes('obligatorio') || error.message.includes('allowNull') || error.message.includes('notEmpty'),
            `Error correcto para campo obligatorio faltante: ${campo}`
          );
        }
      }
    });

    // Test 7: Unicidad de RUT y email
    this.runner.describe('Validación de unicidad RUT y email', async () => {
      const docente1 = await this.models.Docente.create({
        ...TEST_DATA.DOCENTE,
        rut: '87654321-0',
        email: 'unicidad.test@test.com'
      });
      
      // Intentar crear otro docente con el mismo RUT
      try {
        await this.models.Docente.create({
          ...TEST_DATA.DOCENTE,
          rut: '87654321-0', // Mismo RUT
          email: 'otro.email@test.com'
        });
        
        throw new Error('RUT duplicado debería haber sido rechazado');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.message.includes('unique') || error.message.includes('Duplicate') || error.message.includes('must be unique'),
          'Error correcto para RUT duplicado'
        );
      }
      
      // Intentar crear otro docente con el mismo email
      try {
        await this.models.Docente.create({
          ...TEST_DATA.DOCENTE,
          rut: '98765432-1',
          email: 'unicidad.test@test.com' // Mismo email
        });
        
        throw new Error('Email duplicado debería haber sido rechazado');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.message.includes('unique') || error.message.includes('Duplicate') || error.message.includes('must be unique'),
          'Error correcto para email duplicado'
        );
      }
      
      await docente1.destroy();
    });

    // Test 8: Normalización de email (convertir a minúsculas)
    this.runner.describe('Normalización de email', async () => {
      const emailMayusculas = 'PROFESOR.MAYUSCULAS@COLEGIO.CL';
      
      const docente = await this.models.Docente.create({
        ...TEST_DATA.DOCENTE,
        rut: '11111111-1',
        email: emailMayusculas
      });
      
      ValidationTestHelper.assertEquals(docente.email, emailMayusculas.toLowerCase(), 'Email debe convertirse a minúsculas');
      
      await docente.destroy();
    });
  }

  async run() {
    await this.setup();
    this.defineTests();
    const result = await this.runner.run();
    await this.teardown();
    return result;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const tester = new DocenteValidationTests();
  tester.run()
    .then((result) => {
      console.log(`\n✨ Tests de validaciones Docente completados`);
      console.log(`📊 Exitosos: ${result.passed}, Fallidos: ${result.failed}`);
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = DocenteValidationTests;
