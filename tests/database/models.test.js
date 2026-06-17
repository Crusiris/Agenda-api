/**
 require('dotenv').config();
const { connect, disconnect, syncModels, getI      // Test CREATE
      const docente = await this.models.Docente.create({
        rut: '12345678-9',
        nombre: 'Test Docente',
        email: 'test@test.com',
        password: 'password123',
        asignatura: 'Test Subject',
        cursos: ['1A'],
        es_profesor_jefe: false
      });= require('../../database/connection');
const { initializeModels } = require('../../models');est de Conexión de Base de Datos MySQL
 * Verifica la conectividad, creación de tablas y operaciones básicas
 */

require('dotenv').config();
const { connect, disconnect, syncModels, getStatus, getInstance } = require('../../database/connection');
const { initializeModels } = require('../../models');

class DatabaseTest {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.models = null;
  }

  log(message, type = 'info') {
    const symbols = {
      info: '🔵',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    console.log(`${symbols[type]} ${message}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`Ejecutando: ${testName}`, 'info');
      await testFunction();
      this.log(`PASSED: ${testName}`, 'success');
      this.passed++;
    } catch (error) {
      this.log(`FAILED: ${testName} - ${error.message}`, 'error');
      this.failed++;
      throw error;
    }
  }

  async testConnection() {
    await this.runTest('Conexión a MySQL', async () => {
      await connect();
      const status = await getStatus();
      
      if (status.state !== 'connected') {
        throw new Error(`Estado de conexión: ${status.state}`);
      }
      
      this.log(`Conectado a: ${status.database} en ${status.host}:${status.port}`);
    });
  }

  async testTableCreation() {
    await this.runTest('Sincronización de modelos', async () => {
      await syncModels(false);
      this.log('Tablas creadas/verificadas correctamente');
    });
  }

  async testModelInitialization() {
    await this.runTest('Inicialización de modelos', async () => {
      this.models = initializeModels();
      
      const expectedModels = ['Docente', 'Apoderado', 'ReporteEscolar', 'Contacto'];
      for (const modelName of expectedModels) {
        if (!this.models[modelName]) {
          throw new Error(`Modelo ${modelName} no inicializado`);
        }
      }
      
      this.log(`${expectedModels.length} modelos inicializados correctamente`);
    });
  }

  async testDatabaseOperations() {
    await this.runTest('Operaciones CRUD básicas', async () => {
      try {
        // Limpiar datos previos del test
        await this.models.Docente.destroy({
          where: {
            rut: '12345678-9'
          }
        });
        
        // Test CREATE
        const docenteData = {
          rut: '12345678-9',
          nombre: 'Test Docente',
          email: 'test@test.com',
          password: 'test123',
          asignatura: 'Test Subject',
          cursos: ['1A'],
          es_profesor_jefe: false
        };
        
        this.log('Creando docente con datos limpios...');
        const docente = await this.models.Docente.create(docenteData);
        
        if (!docente.id) {
          throw new Error('No se creó el docente correctamente');
        }
        
        this.log(`Docente creado con ID: ${docente.id}`);

        // Test READ
        const docenteEncontrado = await this.models.Docente.findByPk(docente.id);
        if (!docenteEncontrado || docenteEncontrado.email !== 'test@test.com') {
          throw new Error('No se pudo leer el docente creado');
        }
        
        this.log('Lectura de docente verificada');

        // Test UPDATE
        await docenteEncontrado.update({ nombre: 'Test Docente Actualizado' });
        await docenteEncontrado.reload();
        
        if (docenteEncontrado.nombre !== 'Test Docente Actualizado') {
          throw new Error('No se actualizó el docente correctamente');
        }
        
        this.log('Actualización de docente verificada');

        // Test DELETE
        await docenteEncontrado.destroy();
        const docenteEliminado = await this.models.Docente.findByPk(docente.id);
        
        if (docenteEliminado) {
          throw new Error('No se eliminó el docente correctamente');
        }
        
        this.log('Eliminación de docente verificada');
      } catch (error) {
        console.log('Error completo:', error.message);
        if (error.errors) {
          console.log('Errores de validación:');
          error.errors.forEach(err => {
            console.log(`- Campo '${err.path}': ${err.message} (Valor: ${err.value})`);
          });
        }
        throw error;
      }
    });
  }

  async testRelationships() {
    await this.runTest('Relaciones entre modelos', async () => {
      // Limpiar datos previos del test
      await this.models.Docente.destroy({
        where: {
          rut: '87654321-K'
        }
      });
      
      // Crear docente
      const docente = await this.models.Docente.create({
        rut: '87654321-K',
        nombre: 'Docente Relación',
        email: 'relacion@test.com',
        password: 'test123',
        asignatura: 'Matemáticas',
        cursos: ['2A'],
        es_profesor_jefe: true
      });

      // Crear reporte asociado
      const reporte = await this.models.ReporteEscolar.create({
        tipo: 'asistencia',
        curso: '2A',
        docenteId: docente.id,
        contenido: {
          fecha: new Date().toISOString().split('T')[0],
          presentes: 20,
          ausentes: 5
        }
      });

      // Verificar relación
      const docenteConReportes = await this.models.Docente.findByPk(docente.id, {
        include: [{ model: this.models.ReporteEscolar, as: 'reportes' }]
      });

      if (!docenteConReportes.reportes || docenteConReportes.reportes.length === 0) {
        throw new Error('La relación Docente -> ReporteEscolar no funciona');
      }

      this.log('Relación Docente -> ReporteEscolar verificada');

      // Limpiar datos de prueba
      await reporte.destroy();
      await docente.destroy();
    });
  }

  async testValidations() {
    await this.runTest('Validaciones de modelos', async () => {
      // Test validación de RUT
      try {
        await this.models.Docente.create({
          rut: 'rut-invalido',
          nombre: 'Test',
          email: 'test@test.com',
          password: 'test123',
          asignatura: 'Test'
        });
        throw new Error('Debería haber fallado la validación de RUT');
      } catch (error) {
        if (!error.message.includes('RUT inválido')) {
          throw new Error('Validación de RUT no está funcionando correctamente');
        }
      }

      // Test validación de email
      try {
        await this.models.Docente.create({
          rut: '11111111-1',
          nombre: 'Test',
          email: 'email-invalido',
          password: 'test123',
          asignatura: 'Test'
        });
        throw new Error('Debería haber fallado la validación de email');
      } catch (error) {
        if (!error.message.includes('email')) {
          throw new Error('Validación de email no está funcionando correctamente');
        }
      }

      this.log('Validaciones de RUT y email funcionando correctamente');
    });
  }

  async testPasswordHashing() {
    await this.runTest('Hash de contraseñas', async () => {
      const docente = await this.models.Docente.create({
        rut: '22222222-2',
        nombre: 'Test Password',
        email: 'password@test.com',
        password: 'plaintext123',
        asignatura: 'Test'
      });

      // Obtener con contraseña
      const docenteConPassword = await this.models.Docente.scope('withPassword').findByPk(docente.id);
      
      if (docenteConPassword.password === 'plaintext123') {
        throw new Error('La contraseña no se encriptó');
      }

      // Verificar que el método de comparación funciona
      const passwordCorrecta = await docenteConPassword.compararPassword('plaintext123');
      const passwordIncorrecta = await docenteConPassword.compararPassword('wrongpassword');

      if (!passwordCorrecta || passwordIncorrecta) {
        throw new Error('El método compararPassword no funciona correctamente');
      }

      this.log('Hash y verificación de contraseñas funcionando correctamente');

      // Limpiar
      await docente.destroy();
    });
  }

  async runAllTests() {
    console.log('\n🚀 Iniciando Tests de Base de Datos MySQL\n');
    
    try {
      // Tests de conexión
      await this.testConnection();
      await this.testTableCreation();
      await this.testModelInitialization();
      
      // Tests de funcionalidad
      await this.testDatabaseOperations();
      await this.testRelationships();
      await this.testValidations();
      await this.testPasswordHashing();

      // Resumen final
      console.log('\n📊 Resumen de Tests:');
      this.log(`Tests exitosos: ${this.passed}`, 'success');
      this.log(`Tests fallidos: ${this.failed}`, this.failed > 0 ? 'error' : 'success');
      
      if (this.failed === 0) {
        this.log('🎉 ¡Todos los tests pasaron! La base de datos está funcionando correctamente', 'success');
      } else {
        this.log(`⚠️ ${this.failed} test(s) fallaron. Revisa la configuración`, 'warning');
      }

    } catch (error) {
      this.log(`Error crítico en tests: ${error.message}`, 'error');
      return false;
    } finally {
      // Cerrar conexión
      try {
        await disconnect();
        this.log('Conexión cerrada correctamente', 'info');
      } catch (error) {
        this.log(`Error cerrando conexión: ${error.message}`, 'warning');
      }
    }

    return this.failed === 0;
  }
}

// Función principal
const runDatabaseTests = async () => {
  const tester = new DatabaseTest();
  return await tester.runAllTests();
};

// Ejecutar si se llama directamente
if (require.main === module) {
  runDatabaseTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Error ejecutando tests:', error);
      process.exit(1);
    });
}

module.exports = { DatabaseTest, runDatabaseTests };
