/**
 * 🧪 Test de Integridad Referencial - Foreign Key Constraints
 * 
 * Experto QA: Este script valida que la base de datos MySQL mantenga 
 * correctamente la integridad referencial mediante Foreign Key Constraints.
 * 
 * Test Case: Intentar insertar un reporte con un docente_id inexistente
 * Expected Result: MySQL debe devolver Error 1452 (Foreign Key Constraint)
 */

const { connect, disconnect, query } = require('../../database/connection');

class ForeignKeyIntegrityTest {
  constructor() {
    this.testName = '🔗 Test de Integridad Referencial - Foreign Key Constraints';
    this.passedTests = 0;
    this.failedTests = 0;
  }

  /**
   * Ejecuta el test principal de integridad referencial
   */
  async runForeignKeyTest() {
    console.log('\n🧪 ='.repeat(30));
    console.log(`🧪 ${this.testName}`);
    console.log('🧪 ='.repeat(30));
    
    try {
      // 1. Conectar a la base de datos
      console.log('\n1️⃣ Conectando a MySQL...');
      await connect();
      console.log('   ✅ Conexión establecida');

      // 2. Test: Intentar insertar reporte con docente_id inexistente
      await this.testInvalidForeignKey();
      
      // 3. Test adicional: Verificar que insert válido funciona
      await this.testValidForeignKey();

    } catch (error) {
      console.error(`\n❌ Error crítico en setup: ${error.message}`);
      this.failedTests++;
    } finally {
      // 4. Desconectar
      console.log('\n4️⃣ Cerrando conexión...');
      await disconnect();
      console.log('   🔌 Desconectado correctamente');
      
      // 5. Mostrar resumen
      this.showTestSummary();
    }
  }

  /**
   * Test Case 1: Insert con Foreign Key inválida (debe fallar)
   * Expected: Error 1452 - Cannot add or update a child row
   */
  async testInvalidForeignKey() {
    console.log('\n2️⃣ Test Case 1: Foreign Key Constraint Validation');
    console.log('   📝 Insertando reporte con docente_id inexistente (999)...');
    
    const invalidInsertSQL = `
      INSERT INTO reportes_escolares 
      (tipo, curso, docente_id, contenido, fecha_reporte, estado, prioridad, created_at, updated_at)
      VALUES 
      ('asistencia', 'TEST-FK', 999, '{"test": "foreign key violation"}', CURDATE(), 'activo', 'media', NOW(), NOW())
    `;

    try {
      await query(invalidInsertSQL);
      
      // Si llega aquí, el insert fue exitoso (ERROR - no debería pasar)
      console.log('   ❌ FALLO: El insert debería haber fallado por Foreign Key Constraint');
      console.log('   ❌ La integridad referencial NO está funcionando correctamente');
      this.failedTests++;
      
    } catch (error) {
      // Verificar que sea específicamente el error de Foreign Key
      if (error.message.includes('1452') || 
          error.message.toLowerCase().includes('foreign key constraint') ||
          error.message.toLowerCase().includes('cannot add or update a child row')) {
        
        console.log('   ✅ ÉXITO: Foreign Key Constraint funcionando correctamente');
        console.log(`   ✅ Error esperado capturado: ${error.message.split('\n')[0]}`);
        console.log('   ✅ 🎉 La integridad referencial está PROTEGIDA');
        this.passedTests++;
        
      } else {
        console.log('   ❌ FALLO: Error inesperado (no es Foreign Key Constraint)');
        console.log(`   ❌ Error recibido: ${error.message}`);
        this.failedTests++;
      }
    }
  }

  /**
   * Test Case 2: Insert con Foreign Key válida (debe funcionar)
   * Expected: Insert exitoso
   */
  async testValidForeignKey() {
    console.log('\n3️⃣ Test Case 2: Valid Foreign Key Insert');
    console.log('   📝 Verificando que inserts válidos funcionen...');

    try {
      // Primero, obtener un docente_id válido
      const [docenteResult] = await query('SELECT id FROM docentes LIMIT 1');
      
      if (!docenteResult || docenteResult.length === 0) {
        console.log('   ⚠️  SKIP: No hay docentes en la BD para test válido');
        return;
      }

      const validDocenteId = docenteResult[0].id;
      console.log(`   📋 Usando docente_id válido: ${validDocenteId}`);

      const validInsertSQL = `
        INSERT INTO reportes_escolares 
        (tipo, curso, docente_id, contenido, fecha_reporte, estado, prioridad, created_at, updated_at)
        VALUES 
        ('asistencia', 'TEST-VALID', ${validDocenteId}, '{"test": "valid foreign key"}', CURDATE(), 'activo', 'media', NOW(), NOW())
      `;

      const insertResult = await query(validInsertSQL);
      console.log('   ✅ ÉXITO: Insert con FK válida funcionó correctamente');
      
      // Limpiar el registro de test
      await query('DELETE FROM reportes_escolares WHERE curso = "TEST-VALID"');
      console.log('   🧹 Limpieza: Registro de test eliminado');
      
      this.passedTests++;

    } catch (error) {
      console.log('   ❌ FALLO: Insert válido no debería fallar');
      console.log(`   ❌ Error: ${error.message}`);
      this.failedTests++;
    }
  }

  /**
   * Muestra el resumen final de los tests
   */
  showTestSummary() {
    console.log('\n🏁 ='.repeat(25));
    console.log('🏁 RESUMEN DE TESTS');
    console.log('🏁 ='.repeat(25));
    
    const totalTests = this.passedTests + this.failedTests;
    const successRate = totalTests > 0 ? ((this.passedTests / totalTests) * 100).toFixed(1) : 0;
    
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Exitosos: ${this.passedTests}`);
    console.log(`❌ Fallidos: ${this.failedTests}`);
    console.log(`📈 Tasa de Éxito: ${successRate}%`);
    
    if (this.failedTests === 0) {
      console.log('\n🎉 🎉 ¡TODOS LOS TESTS PASARON!');
      console.log('🔒 La integridad referencial está funcionando correctamente');
      console.log('🔗 Las Foreign Key Constraints están protegiendo la base de datos');
    } else {
      console.log('\n⚠️  ⚠️  ALGUNOS TESTS FALLARON');
      console.log('🔍 Revisar la configuración de Foreign Key Constraints');
    }
    
    console.log('\n🏁 ='.repeat(25));
  }
}

/**
 * Función principal para ejecutar los tests
 */
async function runIntegrityTests() {
  console.log('🚀 Iniciando Tests de Integridad Referencial...');
  console.log('📋 Sistema: Agenda Digital Escolar');
  console.log('🔗 Validando: Foreign Key Constraints en MySQL');
  
  const tester = new ForeignKeyIntegrityTest();
  await tester.runForeignKeyTest();
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  runIntegrityTests()
    .then(() => {
      console.log('✨ Tests completados');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = {
  ForeignKeyIntegrityTest,
  runIntegrityTests
};
