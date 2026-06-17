/**
 * Test Simple de Conexión MySQL
 * Verificación rápida de conectividad
 */

require('dotenv').config();
const { connect, disconnect, getStatus } = require('../../database/connection');

const testSimpleConnection = async () => {
  console.log('🔍 Probando conexión simple a MySQL...\n');
  
  try {
    // Test 1: Conectar
    console.log('1️⃣ Intentando conectar a MySQL...');
    await connect();
    console.log('   ✅ Conexión establecida');

    // Test 2: Verificar estado
    console.log('2️⃣ Verificando estado de la conexión...');
    const status = await getStatus();
    console.log(`   📊 Estado: ${status.state}`);
    console.log(`   🗄️  Base de datos: ${status.database}`);
    console.log(`   🌐 Host: ${status.host}:${status.port}`);

    // Test 3: Verificar configuración
    console.log('3️⃣ Verificando configuración...');
    const requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER'];
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`Variable de entorno ${varName} no está configurada`);
      }
    }
    console.log('   ✅ Variables de entorno configuradas correctamente');

    console.log('\n🎉 ¡Conexión exitosa! MySQL está funcionando correctamente');
    return true;

  } catch (error) {
    console.log('\n❌ Error en la conexión:');
    console.log(`   Mensaje: ${error.message}`);
    
    // Diagnósticos
    console.log('\n🔧 Diagnósticos:');
    console.log('   📝 Verifica que MySQL esté ejecutándose:');
    console.log('      brew services list | grep mysql');
    console.log('      brew services start mysql');
    console.log('\n   🔑 Verifica las credenciales en .env:');
    console.log(`      DB_HOST=${process.env.DB_HOST || 'NO_CONFIGURADO'}`);
    console.log(`      DB_NAME=${process.env.DB_NAME || 'NO_CONFIGURADO'}`);
    console.log(`      DB_USER=${process.env.DB_USER || 'NO_CONFIGURADO'}`);
    console.log(`      DB_PASSWORD=${process.env.DB_PASSWORD ? '***' : 'NO_CONFIGURADO'}`);
    
    return false;
  } finally {
    try {
      await disconnect();
      console.log('🔌 Conexión cerrada correctamente');
    } catch (error) {
      console.log('⚠️ Error cerrando conexión:', error.message);
    }
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  testSimpleConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Error inesperado:', error);
      process.exit(1);
    });
}

module.exports = testSimpleConnection;
