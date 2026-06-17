/**
 * 🧪 Tests Unitarios - Modelo Docente - Métodos Estáticos
 * 
 * Tests específicos para métodos estáticos del modelo Docente:
 * - validarCredenciales()
 * - Otras validaciones a nivel de modelo
 */

const { connect, disconnect } = require('../../../database/connection');
const { initializeModels } = require('../../../database/inicializarDatos');
const ValidationTestHelper = require('../../helpers/utils').ValidationTestHelper;
const TestRunner = require('../../helpers/utils').TestRunner;

class DocenteStaticMethodsTests {
  constructor() {
    this.runner = new TestRunner('Docente - Métodos Estáticos');
    this.models = null;
  }

  async setup() {
    try {
      await connect();
      this.models = initializeModels();
      console.log('✅ Setup completado para tests de métodos estáticos Docente');
    } catch (error) {
      console.error(`❌ Error en setup: ${error.message}`);
      throw error;
    }
  }

  async teardown() {
    try {
      await disconnect();
      console.log('✅ Teardown completado para tests de métodos estáticos Docente');
    } catch (error) {
      console.error(`❌ Error en teardown: ${error.message}`);
    }
  }

  defineTests() {
    // Test 1: validarCredenciales() - credenciales válidas
    this.runner.describe('Validar credenciales válidas', async () => {
      const email = 'docente@colegio.cl';
      const password = 'password123456';
      
      const errores = this.models.Docente.validarCredenciales(email, password);
      
      ValidationTestHelper.assertEquals(errores.length, 0, 'No debe haber errores con credenciales válidas');
    });

    // Test 2: validarCredenciales() - email inválido
    this.runner.describe('Validar email inválido', async () => {
      const emailsInvalidos = [
        'email-sin-arroba',
        '',
        'email@',
        '@dominio.com',
        null,
        undefined
      ];
      
      for (const emailInvalido of emailsInvalidos) {
        const errores = this.models.Docente.validarCredenciales(emailInvalido, 'password123');
        
        ValidationTestHelper.assertTrue(
          errores.length > 0,
          `Debe haber errores para email inválido: ${emailInvalido}`
        );
        
        const tieneErrorEmail = errores.some(error => 
          error.toLowerCase().includes('email') && error.toLowerCase().includes('válido')
        );
        
        ValidationTestHelper.assertTrue(
          tieneErrorEmail,
          `Debe haber error específico de email para: ${emailInvalido}`
        );
      }
    });

    // Test 3: validarCredenciales() - contraseña inválida
    this.runner.describe('Validar contraseña inválida', async () => {
      const passwordsInvalidos = [
        '',
        '123',
        '12345',  // Menos de 6 caracteres
        null,
        undefined
      ];
      
      for (const passwordInvalido of passwordsInvalidos) {
        const errores = this.models.Docente.validarCredenciales('docente@test.com', passwordInvalido);
        
        ValidationTestHelper.assertTrue(
          errores.length > 0,
          `Debe haber errores para password inválido: ${passwordInvalido}`
        );
        
        const tieneErrorPassword = errores.some(error => 
          error.toLowerCase().includes('contraseña') && error.toLowerCase().includes('6')
        );
        
        ValidationTestHelper.assertTrue(
          tieneErrorPassword,
          `Debe haber error específico de contraseña para: ${passwordInvalido}`
        );
      }
    });

    // Test 4: validarCredenciales() - múltiples errores
    this.runner.describe('Validar múltiples errores simultáneos', async () => {
      const errores = this.models.Docente.validarCredenciales('', '123');
      
      ValidationTestHelper.assertTrue(
        errores.length >= 2,
        'Debe haber al menos 2 errores (email y password)'
      );
      
      const tieneErrorEmail = errores.some(error => 
        error.toLowerCase().includes('email')
      );
      
      const tieneErrorPassword = errores.some(error => 
        error.toLowerCase().includes('contraseña')
      );
      
      ValidationTestHelper.assertTrue(tieneErrorEmail, 'Debe haber error de email');
      ValidationTestHelper.assertTrue(tieneErrorPassword, 'Debe haber error de password');
    });

    // Test 5: Verificar que el método es estático
    this.runner.describe('Verificar método estático', async () => {
      // El método debe ser accesible directamente desde el modelo
      ValidationTestHelper.assertTrue(
        typeof this.models.Docente.validarCredenciales === 'function',
        'validarCredenciales debe ser una función estática'
      );
      
      // Debe funcionar sin instancia
      const resultado = this.models.Docente.validarCredenciales('test@test.com', 'password123');
      ValidationTestHelper.assertTrue(
        Array.isArray(resultado),
        'Debe retornar un array sin necesidad de instancia'
      );
    });

    // Test 6: Formato específico de errores
    this.runner.describe('Formato de mensajes de error', async () => {
      const errores = this.models.Docente.validarCredenciales('email-invalido', 'abc');
      
      // Verificar que los errores sean strings descriptivos
      for (const error of errores) {
        ValidationTestHelper.assertTrue(
          typeof error === 'string',
          'Cada error debe ser un string'
        );
        
        ValidationTestHelper.assertTrue(
          error.length > 10,
          'Cada error debe ser descriptivo (más de 10 caracteres)'
        );
      }
    });

    // Test 7: Casos límite
    this.runner.describe('Casos límite de validación', async () => {
      // Email exactamente con @ pero vacío
      let errores = this.models.Docente.validarCredenciales('@', 'password123');
      ValidationTestHelper.assertTrue(
        errores.length > 0,
        'Email solo con @ debe ser inválido'
      );
      
      // Password de exactamente 6 caracteres (límite)
      errores = this.models.Docente.validarCredenciales('test@test.com', 'pass12');
      ValidationTestHelper.assertEquals(
        errores.length, 0,
        'Password de 6 caracteres debe ser válido (caso límite)'
      );
      
      // Password de 5 caracteres (inválido por 1)
      errores = this.models.Docente.validarCredenciales('test@test.com', 'pas12');
      ValidationTestHelper.assertTrue(
        errores.length > 0,
        'Password de 5 caracteres debe ser inválido'
      );
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
  const tester = new DocenteStaticMethodsTests();
  tester.run()
    .then((result) => {
      console.log(`\n✨ Tests de métodos estáticos Docente completados`);
      console.log(`📊 Exitosos: ${result.passed}, Fallidos: ${result.failed}`);
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = DocenteStaticMethodsTests;
