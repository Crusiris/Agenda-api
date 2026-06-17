/**
 * 🔬 QA Test Script - Foreign Key Constraint Validation
 * 
 * Este script valida la integridad referencial de MySQL intentando insertar
 * un registro con una Foreign Key inexistente. El test es exitoso SOLO si 
 * MySQL devuelve el error esperado (Error 1452).
 * 
 * Autor: Experto en QA Automation con Node.js
 * Fecha: Abril 2026
 */

const { connect, disconnect, query } = require('./database/connection');

async function testForeignKeyIntegrity() {
  console.log('🔬 ='.repeat(25));
  console.log('🔬 QA TEST: Foreign Key Constraint Validation');
  console.log('🔬 ='.repeat(25));
  console.log('🎯 Objetivo: Validar que MySQL rechace FK inexistentes');
  console.log('📋 Tabla: reportes_escolares → docentes (FK)');
  console.log('🚫 Test: Insertar con docente_id = 999 (inexistente)');
  console.log('✅ Esperado: Error 1452 - Foreign Key Constraint');
  
  try {
    // Conectar
    console.log('\n🔌 Conectando a MySQL...');
    await connect();
    console.log('✅ Conectado exitosamente');

    // Test Case: Insert con FK inválida
    console.log('\n🧪 Ejecutando test de FK constraint...');
    
    const testSQL = `
      INSERT INTO reportes_escolares 
      (tipo, curso, docente_id, contenido, fecha_reporte, estado, prioridad, created_at, updated_at)
      VALUES 
      ('asistencia', 'QA-TEST', 999, '{"test": true}', CURDATE(), 'activo', 'media', NOW(), NOW())
    `;

    try {
      console.log('📝 SQL: INSERT con docente_id = 999...');
      await query(testSQL);
      
      // Si llega aquí = ERROR
      console.log('\n❌ ❌ ❌ PRUEBA FALLÓ ❌ ❌ ❌');
      console.log('💥 El INSERT debería haber sido RECHAZADO');
      console.log('🚨 La integridad referencial NO está funcionando');
      console.log('⚠️  PROBLEMA CRÍTICO: FK Constraints no configuradas');
      
    } catch (error) {
      // Verificar que sea el error correcto
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('foreign key constraint') || 
          errorMsg.includes('cannot add or update a child row') ||
          errorMsg.includes('1452')) {
        
        console.log('\n✅ ✅ ✅ PRUEBA EXITOSA ✅ ✅ ✅');
        console.log('🎉 MySQL rechazó correctamente la FK inválida');
        console.log('🔒 La integridad referencial ESTÁ PROTEGIDA');
        console.log('🛡️  Foreign Key Constraints funcionando OK');
        console.log(`📄 Error capturado: ${error.message.split('\n')[0]}`);
        
      } else {
        console.log('\n⚠️  ⚠️  RESULTADO INESPERADO ⚠️  ⚠️');
        console.log('❓ Error diferente al esperado');
        console.log(`📄 Error: ${error.message}`);
        console.log('🔍 Revisar configuración de la BD');
      }
    }

  } catch (setupError) {
    console.log('\n💥 ERROR EN SETUP:');
    console.log(`❌ ${setupError.message}`);
    
  } finally {
    // Desconectar
    console.log('\n🔌 Desconectando...');
    await disconnect();
    console.log('👋 Desconectado');
  }

  console.log('\n🏁 Test completado');
  console.log('🔬 ='.repeat(25));
}

// Ejecutar test
if (require.main === module) {
  console.log('🚀 Iniciando QA Test de Foreign Key Constraints...\n');
  
  testForeignKeyIntegrity()
    .then(() => {
      console.log('\n✨ Script finalizado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { testForeignKeyIntegrity };
