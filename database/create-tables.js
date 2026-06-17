/**
 * Script para crear tablas forzadamente
 * Elimina tablas existentes y las recrea
 */

const { connect, syncModels, disconnect } = require('./database/connection');
const { initializeModels } = require('./models');

const createTables = async () => {
  try {
    console.log('🏗️ Creando tablas de la base de datos...');
    
    // Conectar
    await connect();
    
    // Inicializar modelos
    initializeModels();
    
    // Sincronizar con force: true para crear tablas
    console.log('🔄 Creando tablas (force: true)...');
    await syncModels(true); // true = elimina y recrea tablas
    
    console.log('✅ Tablas creadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error creando tablas:', error.message);
    throw error;
  } finally {
    await disconnect();
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('🎉 Tablas listas para usar');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = createTables;
