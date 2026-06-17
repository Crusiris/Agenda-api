/**
 * Script de inicialización y prueba
 * Ejecuta la inicialización de datos y prueba la conexión MySQL
 */

const { inicializarBaseDatos } = require('./database/inicializarDatos');

const main = async () => {
  try {
    console.log('🚀 Iniciando script de inicialización...\n');
    
    // Inicializar base de datos y crear datos de ejemplo
    const baseDatos = await inicializarBaseDatos();
    
    console.log('\n✅ Inicialización completada exitosamente');
    console.log('🎯 El servidor está listo para funcionar con MySQL');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Asegúrate de tener MySQL instalado y ejecutándose');
    console.log('2. Crea una base de datos llamada "agenda_escolar"');
    console.log('3. Configura las credenciales en el archivo .env');
    console.log('4. Ejecuta: npm start');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error en la inicialización:', error.message);
    console.error('\n🔧 Posibles soluciones:');
    console.error('1. Verificar que MySQL esté instalado y ejecutándose');
    console.error('2. Verificar las credenciales en el archivo .env');
    console.error('3. Crear la base de datos "agenda_escolar" manualmente');
    console.error('4. Verificar permisos de usuario MySQL');
    
    process.exit(1);
  }
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main();
}

module.exports = main;
