/**
 * 🧪 Tests Unitarios - Modelo Docente - Métodos de Instancia
 * 
 * Tests específicos para métodos de instancia del modelo Docente:
 * - definirPermisos()
 * - puedeCrearReporteEnCurso()
 * - compararPassword()
 * - registrarAcceso()
 * - obtenerPerfilPublico()
 */

const bcrypt = require('bcrypt');
const { connect, disconnect } = require('../../../database/connection');
const { initializeModels } = require('../../../database/inicializarDatos');
const ValidationTestHelper = require('../../helpers/utils').ValidationTestHelper;
const TestRunner = require('../../helpers/utils').TestRunner;
const { TEST_DATA } = require('../../helpers/config');

class DocenteMethodsTests {
  constructor() {
    this.runner = new TestRunner('Docente - Métodos de Instancia');
    this.models = null;
  }

  async setup() {
    try {
      await connect();
      this.models = initializeModels();
      console.log('✅ Setup completado para tests de métodos Docente');
    } catch (error) {
      console.error(`❌ Error en setup: ${error.message}`);
      throw error;
    }
  }

  async teardown() {
    try {
      await this.models.Docente.destroy({
        where: {
          email: {
            [require('sequelize').Op.like]: '%test%'
          }
        }
      });
      await disconnect();
      console.log('✅ Teardown completado para tests de métodos Docente');
    } catch (error) {
      console.error(`❌ Error en teardown: ${error.message}`);
    }
  }

  defineTests() {
    // Test 1: definirPermisos() para profesor normal
    this.runner.describe('Permisos de profesor normal', async () => {
      const docente = await this.models.Docente.create({
        ...TEST_DATA.DOCENTE,
        email: 'profesor.normal@test.com',
        es_profesor_jefe: false
      });
      
      const permisos = docente.definirPermisos();
      
      const permisosEsperados = [
        'crear_reportes',
        'ver_asistencia',
        'enviar_avisos'
      ];
      
      ValidationTestHelper.assertEquals(permisos.length, permisosEsperados.length, 'Cantidad de permisos correcta para profesor normal');
      
      for (const permiso of permisosEsperados) {
        ValidationTestHelper.assertTrue(
          permisos.includes(permiso),
          `Profesor normal debe tener permiso: ${permiso}`
        );
      }
      
      // Verificar que NO tenga permisos de profesor jefe
      const permisosPorfesorJefe = ['gestionar_curso', 'ver_estadisticas_completas', 'contactar_apoderados'];
      for (const permiso of permisosPorfesorJefe) {
        ValidationTestHelper.assertFalse(
          permisos.includes(permiso),
          `Profesor normal NO debe tener permiso: ${permiso}`
        );
      }
      
      await docente.destroy();
    });

    // Test 2: definirPermisos() para profesor jefe
    this.runner.describe('Permisos de profesor jefe', async () => {
      const docente = await this.models.Docente.create({
        ...TEST_DATA.DOCENTE,
        email: 'profesor.jefe@test.com',
        es_profesor_jefe: true
      });
      
      const permisos = docente.definirPermisos();
      
      const todosLosPermisos = [
        'crear_reportes',
        'ver_asistencia',
        'enviar_avisos',
        'gestionar_curso',
        'ver_estadisticas_completas',
        'contactar_apoderados'
      ];
      
      ValidationTestHelper.assertEquals(permisos.length, todosLosPermisos.length, 'Cantidad de permisos correcta para profesor jefe');
      
      for (const permiso of todosLosPermisos) {
        ValidationTestHelper.assertTrue(
          permisos.includes(permiso),
          `Profesor jefe debe tener permiso: ${permiso}`
        );
      }
      
      await docente.destroy();
    });

    // Test 3: puedeCrearReporteEnCurso() - curso asignado
    this.runner.describe('Crear reporte en curso asignado', async () => {
      const docente = await this.models.Docente.create({
        ...TEST_DATA.DOCENTE,
        email: 'profesor.cursos@test.com',
        cursos: ['1A', '2B', '3C']
      });
      
      ValidationTestHelper.assertTrue(
        docente.puedeCrearReporteEnCurso('1A'),
        'Debe poder crear reporte en curso asignado 1A'
      );
      
      ValidationTestHelper.assertTrue(
        docente.puedeCrearReporteEnCurso('2B'),
        'Debe poder crear reporte en curso asignado 2B'
      );
      
      ValidationTestHelper.assertTrue(
        docente.puedeCrearReporteEnCurso('3C'),
        'Debe poder crear reporte en curso asignado 3C'
      );
      
      await docente.destroy();
    });

    // Test 4: puedeCrearReporteEnCurso() - curso no asignado
    this.runner.describe('Crear reporte en curso no asignado', async () => {
      const docente = await this.models.Docente.create({
        ...TEST_DATA.DOCENTE,
        email: 'profesor.limitado@test.com',
        cursos: ['1A', '2B']
      });
      
      ValidationTestHelper.assertFalse(
        docente.puedeCrearReporteEnCurso('3C'),
        'NO debe poder crear reporte en curso no asignado 3C'
      );
      
      ValidationTestHelper.assertFalse(
        docente.puedeCrearReporteEnCurso('4D'),
        'NO debe poder crear reporte en curso no asignado 4D'
      );
      
      await docente.destroy();
    });

    // Test 5: compararPassword() - contraseña correcta
    this.runner.describe('Comparar contraseña correcta', async () => {
      const passwordOriginal = 'mi-password-secreto';
      
      const docente = await this.models.Docente.create({
        ...TEST_DATA.DOCENTE,
        email: 'test.password.correcto@test.com',
        password: passwordOriginal
      });
      
      const esCorrecta = await docente.compararPassword(passwordOriginal);
      
      ValidationTestHelper.assertTrue(esCorrecta, 'Contraseña correcta debe retornar true');
      
      await docente.destroy();
    });

    // Test 6: compararPassword() - contraseña incorrecta
    this.runner.describe('Comparar contraseña incorrecta', async () => {
      const passwordOriginal = 'mi-password-secreto';
      const passwordIncorrecto = 'password-incorrecto';
      
      const docente = await this.models.Docente.create({
        ...TEST_DATA.DOCENTE,
        email: 'test.password.incorrecto@test.com',
        password: passwordOriginal
      });
      
      const esCorrecta = await docente.compararPassword(passwordIncorrecto);
      
      ValidationTestHelper.assertFalse(esCorrecta, 'Contraseña incorrecta debe retornar false');
      
      await docente.destroy();
    });

    // Test 7: registrarAcceso()
    this.runner.describe('Registrar último acceso', async () => {
      const docente = await this.models.Docente.create({
        ...TEST_DATA.DOCENTE,
        email: 'test.acceso@test.com'
      });
      
      const fechaAntes = new Date();
      await new Promise(resolve => setTimeout(resolve, 100)); // Esperar 100ms
      
      await docente.registrarAcceso();
      
      await docente.reload(); // Recargar desde BD
      
      ValidationTestHelper.assertTrue(
        docente.fechaUltimoAcceso instanceof Date,
        'Fecha de último acceso debe ser un objeto Date'
      );
      
      ValidationTestHelper.assertTrue(
        docente.fechaUltimoAcceso >= fechaAntes,
        'Fecha de último acceso debe ser posterior al momento de la prueba'
      );
      
      await docente.destroy();
    });

    // Test 8: obtenerPerfilPublico()
    this.runner.describe('Obtener perfil público', async () => {
      const datosDocente = {
        ...TEST_DATA.DOCENTE,
        email: 'test.perfil.publico@test.com',
        cursos: ['1A', '2B'],
        es_profesor_jefe: true
      };
      
      const docente = await this.models.Docente.create(datosDocente);
      
      const perfilPublico = docente.obtenerPerfilPublico();
      
      // Verificar que contiene los campos esperados
      const camposEsperados = ['id', 'nombre', 'asignatura', 'cursos', 'esProfesorJefe', 'createdAt'];
      
      for (const campo of camposEsperados) {
        ValidationTestHelper.assertTrue(
          perfilPublico.hasOwnProperty(campo),
          `Perfil público debe contener campo: ${campo}`
        );
      }
      
      // Verificar que NO contiene información sensible
      const camposSensibles = ['password', 'email', 'rut'];
      
      for (const campo of camposSensibles) {
        ValidationTestHelper.assertFalse(
          perfilPublico.hasOwnProperty(campo),
          `Perfil público NO debe contener campo sensible: ${campo}`
        );
      }
      
      // Verificar valores específicos
      ValidationTestHelper.assertEquals(perfilPublico.nombre, datosDocente.nombre);
      ValidationTestHelper.assertEquals(perfilPublico.asignatura, datosDocente.asignatura);
      ValidationTestHelper.assertEquals(JSON.stringify(perfilPublico.cursos), JSON.stringify(datosDocente.cursos));
      
      await docente.destroy();
    });

    // Test 9: Hash de contraseña automático
    this.runner.describe('Hash automático de contraseña', async () => {
      const passwordOriginal = 'password-sin-hash';
      
      const docente = await this.models.Docente.create({
        ...TEST_DATA.DOCENTE,
        email: 'test.hash.auto@test.com',
        password: passwordOriginal
      });
      
      // La contraseña almacenada NO debe ser igual a la original
      ValidationTestHelper.assertTrue(
        docente.password !== passwordOriginal,
        'Password almacenado debe estar hasheado'
      );
      
      // Debe empezar con el prefijo de bcrypt
      ValidationTestHelper.assertTrue(
        docente.password.startsWith('$2'),
        'Password debe tener formato de hash bcrypt'
      );
      
      // Debe poder verificarse con la contraseña original
      const esValida = await bcrypt.compare(passwordOriginal, docente.password);
      ValidationTestHelper.assertTrue(esValida, 'Hash debe poder verificarse con password original');
      
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
  const tester = new DocenteMethodsTests();
  tester.run()
    .then((result) => {
      console.log(`\n✨ Tests de métodos Docente completados`);
      console.log(`📊 Exitosos: ${result.passed}, Fallidos: ${result.failed}`);
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = DocenteMethodsTests;
