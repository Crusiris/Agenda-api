/**
 * Script de migración — Agenda Digital Escolar
 * Aplica cambios de esquema sobre una BD existente (ej: Aiven).
 * Seguro de ejecutar múltiples veces: verifica si la columna ya existe antes de agregar.
 *
 * Uso:
 *   node database/migrate.js
 *   DB_URL=mysql://... node database/migrate.js
 */

const { connect } = require('./connection');

const migrations = [
  {
    id: '001_add_leido_por_to_reportes_escolares',
    description: 'Agrega columna leido_por (JSON) a reportes_escolares para el sistema de lectura',
    async up(queryInterface) {
      const tableDesc = await queryInterface.describeTable('reportes_escolares');
      if (tableDesc.leido_por) {
        console.log('   ⏭  leido_por ya existe, se omite');
        return;
      }
      await queryInterface.addColumn('reportes_escolares', 'leido_por', {
        type: 'JSON',
        allowNull: true,
        defaultValue: null,
        after: 'fecha'
      });
      console.log('   ✅ Columna leido_por agregada');
    }
  }
];

const runMigrations = async () => {
  try {
    console.log('🔄 Iniciando migraciones...\n');
    const { getInstance } = require('./connection');
    await connect();
    const sequelize = getInstance();
    const queryInterface = sequelize.getQueryInterface();

    for (const migration of migrations) {
      console.log(`📋 [${migration.id}] ${migration.description}`);
      await migration.up(queryInterface);
    }

    console.log('\n✅ Migraciones completadas');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error en migración:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
