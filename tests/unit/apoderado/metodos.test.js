/**
 * 🧪 Tests Unitarios - Modelo Apoderado - Métodos de Instancia
 * 
 * Tests específicos para métodos de instancia del modelo Apoderado:
 * - compararPassword()
 * - registrarAcceso()
 * - agregarHijo()
 * - removerHijo()
 * - actualizarConfiguracionNotificaciones()
 * - obtenerPerfilPublico()
 * - puedeRecibirNotificacion()
 */

const bcrypt = require('bcrypt');
const { connect, disconnect } = require('../../../database/connection');
const { initializeModels } = require('../../../database/inicializarDatos');
const ValidationTestHelper = require('../../helpers/utils').ValidationTestHelper;
const TestRunner = require('../../helpers/utils').TestRunner;
const { TEST_DATA } = require('../../helpers/config');

class ApoderadoMethodsTests {
  constructor() {
    this.runner = new TestRunner('Apoderado - Métodos de Instancia');
    this.models = null;
  }

  async setup() {
    try {
      await connect();
      this.models = initializeModels();
      console.log('✅ Setup completado para tests de métodos Apoderado');
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
      console.log('✅ Teardown completado para tests de métodos Apoderado');
    } catch (error) {
      console.error(`❌ Error en teardown: ${error.message}`);
    }
  }

  defineTests() {
    // Test 1: compararPassword() - contraseña correcta
    this.runner.describe('Comparar contraseña correcta', async () => {
      const passwordOriginal = 'mi-password-apoderado';
      
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        email: 'test.password.correcto@test.com',
        password: passwordOriginal
      });
      
      const esCorrecta = await apoderado.compararPassword(passwordOriginal);
      
      ValidationTestHelper.assertTrue(esCorrecta, 'Contraseña correcta debe retornar true');
      
      await apoderado.destroy();
    });

    // Test 2: compararPassword() - contraseña incorrecta
    this.runner.describe('Comparar contraseña incorrecta', async () => {
      const passwordOriginal = 'mi-password-apoderado';
      const passwordIncorrecto = 'password-equivocado';
      
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        email: 'test.password.incorrecto@test.com',
        password: passwordOriginal
      });
      
      const esCorrecta = await apoderado.compararPassword(passwordIncorrecto);
      
      ValidationTestHelper.assertFalse(esCorrecta, 'Contraseña incorrecta debe retornar false');
      
      await apoderado.destroy();
    });

    // Test 3: registrarAcceso()
    this.runner.describe('Registrar último acceso', async () => {
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        email: 'test.acceso@test.com'
      });
      
      const fechaAntes = new Date();
      await new Promise(resolve => setTimeout(resolve, 100)); // Esperar 100ms
      
      await apoderado.registrarAcceso();
      
      await apoderado.reload(); // Recargar desde BD
      
      ValidationTestHelper.assertTrue(
        apoderado.fechaUltimoAcceso instanceof Date,
        'Fecha de último acceso debe ser un objeto Date'
      );
      
      ValidationTestHelper.assertTrue(
        apoderado.fechaUltimoAcceso >= fechaAntes,
        'Fecha de último acceso debe ser posterior al momento de la prueba'
      );
      
      await apoderado.destroy();
    });

    // Test 4: agregarHijo()
    this.runner.describe('Agregar hijo', async () => {
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        email: 'test.agregar.hijo@test.com'
      });
      
      const nuevoHijo = {
        nombre: 'Pedro López',
        rut: '20345678-9',
        curso: '4C',
        edad: 9
      };
      
      await apoderado.agregarHijo(nuevoHijo);
      await apoderado.reload();
      
      ValidationTestHelper.assertTrue(Array.isArray(apoderado.hijos), 'Hijos debe ser un array');
      
      const hijoEncontrado = apoderado.hijos.find(h => h.rut === nuevoHijo.rut);
      ValidationTestHelper.assertTrue(hijoEncontrado !== undefined, 'Hijo debe haber sido agregado');
      
      ValidationTestHelper.assertEquals(hijoEncontrado.nombre, nuevoHijo.nombre);
      ValidationTestHelper.assertEquals(hijoEncontrado.curso, nuevoHijo.curso);
      ValidationTestHelper.assertEquals(hijoEncontrado.edad, nuevoHijo.edad);
      
      await apoderado.destroy();
    });

    // Test 5: removerHijo()
    this.runner.describe('Remover hijo', async () => {
      const hijoParaRemover = {
        nombre: 'Ana Martínez',
        rut: '20456789-0',
        curso: '2B',
        edad: 7
      };
      
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        email: 'test.remover.hijo@test.com',
        hijos: [hijoParaRemover, ...TEST_DATA.APODERADO.hijos]
      });
      
      const hijosAntesDeRemover = apoderado.hijos.length;
      
      await apoderado.removerHijo(hijoParaRemover.rut);
      await apoderado.reload();
      
      ValidationTestHelper.assertEquals(
        apoderado.hijos.length,
        hijosAntesDeRemover - 1,
        'Debe haber un hijo menos después de remover'
      );
      
      const hijoRemovidoEncontrado = apoderado.hijos.find(h => h.rut === hijoParaRemover.rut);
      ValidationTestHelper.assertTrue(
        hijoRemovidoEncontrado === undefined,
        'Hijo removido no debe estar en la lista'
      );
      
      await apoderado.destroy();
    });

    // Test 6: actualizarConfiguracionNotificaciones()
    this.runner.describe('Actualizar configuración de notificaciones', async () => {
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        email: 'test.config.notif@test.com',
        configuracionNotificaciones: {
          horarioNotificaciones: { inicio: '08:00', fin: '20:00' },
          notificacionesInmediatas: { asistencia: true }
        }
      });
      
      const nuevaConfig = {
        horarioNotificaciones: { inicio: '07:00', fin: '22:00' },
        notificacionesInmediatas: { asistencia: true, reportes: false },
        emailNotificaciones: true
      };
      
      await apoderado.actualizarConfiguracionNotificaciones(nuevaConfig);
      await apoderado.reload();
      
      const config = apoderado.configuracionNotificaciones;
      
      ValidationTestHelper.assertEquals(
        config.horarioNotificaciones.inicio,
        '07:00',
        'Hora de inicio debe actualizarse'
      );
      
      ValidationTestHelper.assertEquals(
        config.horarioNotificaciones.fin,
        '22:00',
        'Hora de fin debe actualizarse'
      );
      
      ValidationTestHelper.assertEquals(
        config.notificacionesInmediatas.reportes,
        false,
        'Nueva configuración de reportes debe guardarse'
      );
      
      ValidationTestHelper.assertEquals(
        config.emailNotificaciones,
        true,
        'Nueva propiedad debe agregarse'
      );
      
      await apoderado.destroy();
    });

    // Test 7: obtenerPerfilPublico()
    this.runner.describe('Obtener perfil público', async () => {
      const datosApoderado = {
        ...TEST_DATA.APODERADO,
        email: 'test.perfil.publico@test.com'
      };
      
      const apoderado = await this.models.Apoderado.create(datosApoderado);
      
      const perfilPublico = apoderado.obtenerPerfilPublico();
      
      // Verificar que contiene los campos esperados
      const camposEsperados = ['id', 'nombre', 'email', 'telefono', 'hijos', 'activo', 'createdAt'];
      
      for (const campo of camposEsperados) {
        ValidationTestHelper.assertTrue(
          perfilPublico.hasOwnProperty(campo),
          `Perfil público debe contener campo: ${campo}`
        );
      }
      
      // Verificar que NO contiene información sensible
      const camposSensibles = ['password', 'rut', 'configuracionNotificaciones'];
      
      for (const campo of camposSensibles) {
        ValidationTestHelper.assertFalse(
          perfilPublico.hasOwnProperty(campo),
          `Perfil público NO debe contener campo sensible: ${campo}`
        );
      }
      
      // Verificar valores específicos
      ValidationTestHelper.assertEquals(perfilPublico.nombre, datosApoderado.nombre);
      ValidationTestHelper.assertEquals(perfilPublico.email, datosApoderado.email.toLowerCase());
      ValidationTestHelper.assertEquals(perfilPublico.telefono, datosApoderado.telefono);
      
      await apoderado.destroy();
    });

    // Test 8: puedeRecibirNotificacion() - dentro del horario permitido
    this.runner.describe('Puede recibir notificación - horario permitido', async () => {
      // Configurar horario que incluya la hora actual
      const ahora = new Date();
      const horaActual = ahora.getHours();
      const horaInicio = Math.max(0, horaActual - 1);
      const horaFin = Math.min(23, horaActual + 1);
      
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        email: 'test.notif.permitida@test.com',
        configuracionNotificaciones: {
          horarioNotificaciones: { 
            inicio: `${horaInicio.toString().padStart(2, '0')}:00`, 
            fin: `${horaFin.toString().padStart(2, '0')}:00` 
          },
          notificacionesInmediatas: { asistencia: true }
        }
      });
      
      const puedeRecibir = apoderado.puedeRecibirNotificacion('asistencia');
      
      ValidationTestHelper.assertTrue(
        puedeRecibir,
        'Debe poder recibir notificación dentro del horario permitido'
      );
      
      await apoderado.destroy();
    });

    // Test 9: puedeRecibirNotificacion() - notificación deshabilitada
    this.runner.describe('Puede recibir notificación - tipo deshabilitado', async () => {
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        email: 'test.notif.deshabilitada@test.com',
        configuracionNotificaciones: {
          notificacionesInmediatas: { 
            asistencia: false,  // Explícitamente deshabilitada
            reportes: true 
          }
        }
      });
      
      const puedeRecibirAsistencia = apoderado.puedeRecibirNotificacion('asistencia');
      const puedeRecibirReportes = apoderado.puedeRecibirNotificacion('reportes');
      
      ValidationTestHelper.assertFalse(
        puedeRecibirAsistencia,
        'NO debe poder recibir notificación de asistencia (deshabilitada)'
      );
      
      ValidationTestHelper.assertTrue(
        puedeRecibirReportes,
        'Debe poder recibir notificación de reportes (habilitada)'
      );
      
      await apoderado.destroy();
    });

    // Test 10: puedeRecibirNotificacion() - sin configuración específica
    this.runner.describe('Puede recibir notificación - configuración por defecto', async () => {
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        email: 'test.notif.defecto@test.com',
        configuracionNotificaciones: {} // Configuración vacía
      });
      
      const puedeRecibir = apoderado.puedeRecibirNotificacion('cualquier_tipo');
      
      ValidationTestHelper.assertTrue(
        puedeRecibir,
        'Debe poder recibir notificación por defecto si no hay configuración específica'
      );
      
      await apoderado.destroy();
    });

    // Test 11: Hash automático de contraseña
    this.runner.describe('Hash automático de contraseña', async () => {
      const passwordOriginal = 'password-apoderado-sin-hash';
      
      const apoderado = await this.models.Apoderado.create({
        ...TEST_DATA.APODERADO,
        email: 'test.hash.auto@test.com',
        password: passwordOriginal
      });
      
      // La contraseña almacenada NO debe ser igual a la original
      ValidationTestHelper.assertTrue(
        apoderado.password !== passwordOriginal,
        'Password almacenado debe estar hasheado'
      );
      
      // Debe empezar con el prefijo de bcrypt
      ValidationTestHelper.assertTrue(
        apoderado.password.startsWith('$2'),
        'Password debe tener formato de hash bcrypt'
      );
      
      // Debe poder verificarse con la contraseña original
      const esValida = await bcrypt.compare(passwordOriginal, apoderado.password);
      ValidationTestHelper.assertTrue(esValida, 'Hash debe poder verificarse con password original');
      
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
  const tester = new ApoderadoMethodsTests();
  tester.run()
    .then((result) => {
      console.log(`\n✨ Tests de métodos Apoderado completados`);
      console.log(`📊 Exitosos: ${result.passed}, Fallidos: ${result.failed}`);
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = ApoderadoMethodsTests;
