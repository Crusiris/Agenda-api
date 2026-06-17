/**
 * 🧪 Tests Unitarios - Modelo Apoderado - Validaciones
 * 
 * Tests específicos para validaciones del modelo Apoderado:
 * - Validación de RUT
 * - Validación de email
 * - Validación de teléfono
 * - Validaciones de campos obligatorios
 */

const { connect, disconnect } = require('../../../database/connection');
const { initializeModels } = require('../../../database/inicializarDatos');
const ValidationTestHelper = require('../../helpers/utils').ValidationTestHelper;
const TestRunner = require('../../helpers/utils').TestRunner;
const { TEST_DATA } = require('../../helpers/config');

class ApoderadoValidationTests {
  constructor() {
    this.runner = new TestRunner('Apoderado - Validaciones');
    this.models = null;
  }

  async setup() {
    try {
      await connect();
      this.models = initializeModels();
      console.log('✅ Setup completado para tests de validaciones Apoderado');
    } catch (error) {
      console.error(`❌ Error en setup: ${error.message}`);
      throw error;
    }
  }

  async teardown() {
    try {
      await this.models.Apoderado.destroy({
        where: {
          email: {
            [require('sequelize').Op.like]: '%test%'
          }
        }
      });
      await disconnect();
      console.log('✅ Teardown completado para tests de validaciones Apoderado');
    } catch (error) {
      console.error(`❌ Error en teardown: ${error.message}`);
    }
  }

  defineTests() {
    // Test 1: Validación de RUT correcto
    this.runner.describe('Validación de RUT correcto', async () => {
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        email: 'test.rut.valido@test.com'
      });
      
      ValidationTestHelper.assertTrue(apoderado.id > 0, 'Apoderado con RUT válido debe crearse');
      ValidationTestHelper.assertEquals(apoderado.rut, TEST_DATA.APODERADO.rut);
      
      await apoderado.destroy();
    });

    // Test 2: Validación de RUT inválido
    this.runner.describe('Validación de RUT inválido', async () => {
      const rutesInvalidos = [
        '12345678',     // Sin dígito verificador
        '123456789',    // Muy largo
        '1234567-X',    // Dígito verificador inválido para números
        'abc12345-6',   // Contiene letras en número
        '12-345-678-9', // Formato incorrecto
        ''              // Vacío
      ];

      for (const rutInvalido of rutesInvalidos) {
        try {
          await this.models.Apoderado.create({
            ...TEST_DATA.APODERADO,
            rut: rutInvalido,
            email: `test.rut.${Date.now()}.${Math.random()}@test.com`
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
        'apoderado@gmail.com',
        'maria.gonzalez@hotmail.cl',
        'padre.familia+noticias@yahoo.com'
      ];

      for (const emailValido of emailsValidos) {
        const apoderado = await this.models.Apoderado.create({
          ...TEST_DATA.APODERADO,
          rut: `${Math.floor(Math.random() * 10000000) + 10000000}-9`,
          email: emailValido
        });
        
        ValidationTestHelper.assertTrue(apoderado.id > 0, `Email válido debe aceptarse: ${emailValido}`);
        ValidationTestHelper.assertEquals(apoderado.email, emailValido.toLowerCase());
        
        await apoderado.destroy();
      }
    });

    // Test 4: Validación de teléfono correcto
    this.runner.describe('Validación de teléfono correcto', async () => {
      const telefonosValidos = [
        '+56987654321',
        '+56912345678',
        '+56923456789'
      ];

      for (const telefonoValido of telefonosValidos) {
        const apoderado = await this.models.Apoderado.create({
          ...TEST_DATA.APODERADO,
          rut: `${Math.floor(Math.random() * 10000000) + 10000000}-K`,
          email: `test.telefono.${Date.now()}@test.com`,
          telefono: telefonoValido
        });
        
        ValidationTestHelper.assertTrue(apoderado.id > 0, `Teléfono válido debe aceptarse: ${telefonoValido}`);
        ValidationTestHelper.assertEquals(apoderado.telefono, telefonoValido);
        
        await apoderado.destroy();
      }
    });

    // Test 5: Validación de teléfono inválido
    this.runner.describe('Validación de teléfono inválido', async () => {
      const telefonosInvalidos = [
        '987654321',      // Sin código de país
        '+5698765432',    // Muy corto
        '+569876543210',  // Muy largo
        '+56abc654321',   // Contiene letras
        '56987654321',    // Sin +
        '+57987654321'    // Código de país incorrecto
      ];

      for (const telefonoInvalido of telefonosInvalidos) {
        try {
          await this.models.Apoderado.create({
            ...TEST_DATA.APODERADO,
            rut: `${Math.floor(Math.random() * 10000000) + 10000000}-1`,
            email: `test.tel.invalid.${Date.now()}@test.com`,
            telefono: telefonoInvalido
          });
          
          throw new Error(`Teléfono ${telefonoInvalido} debería haber sido rechazado`);
        } catch (error) {
          ValidationTestHelper.assertTrue(
            error.message.includes('teléfono') || error.message.includes('Validation') || error.message.includes('phone'),
            `Error correcto para teléfono inválido: ${telefonoInvalido}`
          );
        }
      }
    });

    // Test 6: Campos obligatorios
    this.runner.describe('Validación de campos obligatorios', async () => {
      const camposObligatorios = ['rut', 'nombre', 'email', 'password', 'telefono'];
      
      for (const campo of camposObligatorios) {
        try {
          const datosIncompletos = { ...TEST_DATA.APODERADO };
          delete datosIncompletos[campo];
          datosIncompletos.email = `test.obligatorio.${Date.now()}@test.com`;
          datosIncompletos.rut = `${Math.floor(Math.random() * 10000000) + 10000000}-2`;
          
          await this.models.Apoderado.create(datosIncompletos);
          
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
      const apoderado1 = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        rut: '16789012-3',
        email: 'unicidad.apoderado@test.com'
      });
      
      // Intentar crear otro apoderado con el mismo RUT
      try {
        await this.models.Apoderado.create({
          ...TEST_DATA.APODERADO,
          rut: '16789012-3', // Mismo RUT
          email: 'otro.apoderado@test.com'
        });
        
        throw new Error('RUT duplicado debería haber sido rechazado');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.message.includes('unique') || error.message.includes('Duplicate') || error.message.includes('must be unique'),
          'Error correcto para RUT duplicado'
        );
      }
      
      // Intentar crear otro apoderado con el mismo email
      try {
        await this.models.Apoderado.create({
          ...TEST_DATA.APODERADO,
          rut: '17890123-4',
          email: 'unicidad.apoderado@test.com' // Mismo email
        });
        
        throw new Error('Email duplicado debería haber sido rechazado');
      } catch (error) {
        ValidationTestHelper.assertTrue(
          error.message.includes('unique') || error.message.includes('Duplicate') || error.message.includes('must be unique'),
          'Error correcto para email duplicado'
        );
      }
      
      await apoderado1.destroy();
    });

    // Test 8: Configuración por defecto
    this.runner.describe('Configuración por defecto', async () => {
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        rut: '15678901-2',
        email: 'test.defaults@test.com'
      });
      
      // Verificar valores por defecto
      ValidationTestHelper.assertTrue(apoderado.activo, 'Apoderado debe estar activo por defecto');
      ValidationTestHelper.assertTrue(apoderado.configuracionNotificaciones !== null, 'Debe tener configuración de notificaciones');
      
      await apoderado.destroy();
    });

    // Test 9: Validación de formato de hijos
    this.runner.describe('Validación de formato de hijos', async () => {
      const hijosValidos = [
        {
          nombre: 'Juan Pérez',
          rut: '20123456-7',
          curso: '5A',
          edad: 10
        },
        {
          nombre: 'María González',
          rut: '20234567-8',
          curso: '3B',
          edad: 8
        }
      ];
      
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        rut: '14567890-1',
        email: 'test.hijos@test.com',
        hijos: hijosValidos
      });
      
      ValidationTestHelper.assertTrue(Array.isArray(apoderado.hijos), 'Hijos debe ser un array');
      ValidationTestHelper.assertEquals(apoderado.hijos.length, hijosValidos.length, 'Cantidad de hijos correcta');
      
      for (let i = 0; i < hijosValidos.length; i++) {
        const hijoEsperado = hijosValidos[i];
        const hijoGuardado = apoderado.hijos[i];
        
        ValidationTestHelper.assertEquals(hijoGuardado.nombre, hijoEsperado.nombre);
        ValidationTestHelper.assertEquals(hijoGuardado.rut, hijoEsperado.rut);
        ValidationTestHelper.assertEquals(hijoGuardado.curso, hijoEsperado.curso);
        ValidationTestHelper.assertEquals(hijoGuardado.edad, hijoEsperado.edad);
      }
      
      await apoderado.destroy();
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
  const tester = new ApoderadoValidationTests();
  tester.run()
    .then((result) => {
      console.log(`\n✨ Tests de validaciones Apoderado completados`);
      console.log(`📊 Exitosos: ${result.passed}, Fallidos: ${result.failed}`);
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error.message);
      process.exit(1);
    });
}

