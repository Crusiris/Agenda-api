/**
 * 🔬 QA Test Script - Active Announcements      } else {
        console.log('✅ Tabla AD encontrada');
        console.log('📋 Estructura esperada: id, title, image_url, link_url, is_active, expires_at');
        
        // Agregar algunos datos de prueba para hacer el test más robusto
        console.log('🔧 Agregando datos de prueba adicionales...');
        await addTestData();
      }ter Validation
 * 
 * Este script valida que la consulta SQL filtre correctamente los anuncios
 * por el campo booleano is_active = 1, asegurando que NO se devuelvan
 * registros inactivos (is_active = 0).
 * 
 * Autor: Experto en QA Automation con Node.js
 * Fecha: Abril 2026
 */

const { connect, disconnect, query } = require('./database/connection');

async function testActiveAnnouncementsFilter() {
  console.log('🔬 ='.repeat(30));
  console.log('🔬 QA TEST: Active Announcements Filter Validation');
  console.log('🔬 ='.repeat(30));
  console.log('🎯 Objetivo: Validar filtrado correcto por is_active = 1');
  console.log('📋 Tabla: AD (anuncios)');
  console.log('🔍 Query: SELECT WHERE is_active = 1');
  console.log('✅ Validar: Solo registros activos en resultado');
  
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Conectar
    console.log('\n🔌 Conectando a MySQL...');
    await connect();
    console.log('✅ Conectado exitosamente');

    // Verificar si existe la tabla AD
    console.log('\n🔍 Verificando existencia de tabla AD...');
    try {
      const tableCheckSQL = `
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'AD'
      `;
      
      const [tableResult] = await query(tableCheckSQL);
      const tableExists = tableResult[0].count > 0;
      
      if (!tableExists) {
        console.log('⚠️  Tabla AD no existe. Creando datos de prueba...');
        await createTestData();
      } else {
        console.log('✅ Tabla AD encontrada');
        console.log('� Estructura esperada: id, title, image_url, link_url, is_active, expires_at');
      }
    } catch (error) {
      console.log('⚠️  Error verificando tabla. Creando datos de prueba...');
      await createTestData();
    }

    // Test Case 1: Consulta SELECT con filtro is_active = 1
    console.log('\n🧪 Test Case 1: Consulta SELECT con filtro is_active = 1');
    
    // Usar las columnas reales de la tabla AD
    const selectSQL = `
      SELECT id, title, image_url, link_url, is_active, expires_at
      FROM AD 
      WHERE is_active = 1
      ORDER BY id DESC
    `;

    console.log('📝 Ejecutando query filtrada...');
    const [activeAnnouncements] = await query(selectSQL);
    
    // Validación 1: Verificar que devuelve un arreglo
    console.log('\n📊 Validación 1: Verificar tipo de dato devuelto');
    if (Array.isArray(activeAnnouncements)) {
      console.log('✅ PASS: La consulta devuelve un arreglo de datos');
      console.log(`📋 Total registros encontrados: ${activeAnnouncements.length}`);
      testsPassed++;
    } else {
      console.log('❌ FAIL: La consulta NO devuelve un arreglo');
      console.log(`🔍 Tipo devuelto: ${typeof activeAnnouncements}`);
      testsFailed++;
    }

    // Validación 2: Verificar que ningún registro tenga is_active = 0
    console.log('\n📊 Validación 2: Verificar filtrado correcto (is_active = 1)');
    let hasInactiveRecords = false;
    let inactiveCount = 0;

    if (activeAnnouncements.length > 0) {
      console.log('\n📝 Anuncios encontrados:');
      console.log('='.repeat(50));
      
      activeAnnouncements.forEach((announcement, index) => {
        const isActiveValue = announcement.is_active;
        const title = announcement.title || `Anuncio #${announcement.id}`;
        const imageUrl = announcement.image_url || 'Sin imagen';
        const linkUrl = announcement.link_url || 'Sin enlace';
        const expiresAt = announcement.expires_at || 'Sin expiración';
        
        console.log(`${index + 1}. "${title}" (is_active: ${isActiveValue})`);
        console.log(`   �️  Imagen: ${imageUrl}`);
        console.log(`   🔗 Enlace: ${linkUrl}`);
        console.log(`   ⏰ Expira: ${expiresAt}`);
        
        // Verificar que is_active sea 1 (o true)
        if (isActiveValue !== 1 && isActiveValue !== true) {
          hasInactiveRecords = true;
          inactiveCount++;
          console.log(`   ❌ ERROR: Registro inactivo encontrado (is_active: ${isActiveValue})`);
        }
      });
      
      console.log('='.repeat(50));
      
      if (!hasInactiveRecords) {
        console.log('✅ PASS: Ningún registro tiene is_active = 0');
        console.log('🔒 Filtrado funcionando correctamente');
        testsPassed++;
      } else {
        console.log(`❌ FAIL: ${inactiveCount} registros con is_active ≠ 1 encontrados`);
        console.log('🚨 El filtrado SQL NO está funcionando correctamente');
        testsFailed++;
      }
    } else {
      console.log('📭 No se encontraron anuncios activos');
      console.log('✅ PASS: Consulta ejecutada correctamente (sin resultados)');
      testsPassed++;
    }

    // Test Case 3: Verificación adicional - contar todos vs activos
    console.log('\n🧪 Test Case 3: Verificación de conteo total vs activos');
    
    const totalCountSQL = 'SELECT COUNT(*) as total FROM AD';
    const activeCountSQL = 'SELECT COUNT(*) as active FROM AD WHERE is_active = 1';
    
    const [totalResult] = await query(totalCountSQL);
    const [activeResult] = await query(activeCountSQL);
    
    const totalRecords = totalResult[0].total;
    const activeRecords = activeResult[0].active;
    
    console.log(`📊 Total registros en tabla: ${totalRecords}`);
    console.log(`📊 Registros activos (is_active=1): ${activeRecords}`);
    console.log(`📊 Registros inactivos: ${totalRecords - activeRecords}`);
    
    if (activeRecords === activeAnnouncements.length) {
      console.log('✅ PASS: Conteo coincide con registros devueltos');
      testsPassed++;
    } else {
      console.log('❌ FAIL: Discrepancia en conteo de registros');
      testsFailed++;
    }

  } catch (setupError) {
    console.log('\n💥 ERROR EN EJECUCIÓN:');
    console.log(`❌ ${setupError.message}`);
    testsFailed++;
    
  } finally {
    // Limpiar datos de prueba si fueron creados
    try {
      await cleanupTestData();
    } catch (error) {
      console.log(`⚠️  Error en limpieza: ${error.message}`);
    }
    
    // Desconectar
    console.log('\n🔌 Desconectando...');
    await disconnect();
    console.log('👋 Desconectado');
  }

  // Mostrar resumen
  showTestSummary(testsPassed, testsFailed);
}

/**
 * Crear datos de prueba para la tabla AD
 */
async function createTestData() {
  console.log('🔧 Creando tabla y datos de prueba...');
  
  // Crear tabla AD si no existe (con la estructura real)
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS AD (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      image_url VARCHAR(500),
      link_url VARCHAR(500),
      is_active BOOLEAN DEFAULT 1,
      expires_at TIMESTAMP NULL
    )
  `;
  
  await query(createTableSQL);
  
  // Insertar datos de prueba (algunos activos, algunos inactivos)
  const insertTestDataSQL = `
    INSERT INTO AD (title, image_url, link_url, is_active, expires_at) VALUES
    ('Reunión de Apoderados - Mayo', 'https://example.com/reunion.jpg', 'https://ejemplo.com/reunion', 1, '2026-05-15 18:00:00'),
    ('Actividad Deportiva', 'https://example.com/deporte.jpg', 'https://ejemplo.com/deportes', 1, '2026-06-01 10:00:00'),
    ('Evento Cancelado', 'https://example.com/cancelado.jpg', 'https://ejemplo.com/cancelado', 0, '2026-04-20 12:00:00'),
    ('Nueva Política de Uniformes', 'https://example.com/uniforme.jpg', 'https://ejemplo.com/politicas', 1, NULL),
    ('Anuncio Vencido', 'https://example.com/vencido.jpg', 'https://ejemplo.com/vencido', 0, '2026-04-01 09:00:00'),
    ('Horario de Clases Actualizado', 'https://example.com/horarios.jpg', 'https://ejemplo.com/horarios', 1, '2026-12-31 23:59:59')
  `;
  
  await query(insertTestDataSQL);
  console.log('✅ Datos de prueba creados exitosamente');
}

/**
 * Agregar datos de prueba adicionales a la tabla existente
 */
async function addTestData() {
  try {
    // Insertar algunos registros de prueba (algunos activos, algunos inactivos)
    const insertAdditionalDataSQL = `
      INSERT INTO AD (title, image_url, link_url, is_active, expires_at) VALUES
      ('Anuncio Inactivo Test', 'https://example.com/inactive.jpg', 'https://ejemplo.com/inactive', 0, '2026-03-01 10:00:00'),
      ('Otro Anuncio Inactivo', 'https://example.com/inactive2.jpg', 'https://ejemplo.com/inactive2', 0, '2026-02-15 14:30:00'),
      ('Anuncio Activo Test', 'https://example.com/active.jpg', 'https://ejemplo.com/active', 1, '2026-07-01 16:00:00'),
      ('Promoción Desactivada', 'https://example.com/promo.jpg', 'https://ejemplo.com/promo', 0, '2026-01-31 23:59:59')
    `;
    
    await query(insertAdditionalDataSQL);
    console.log('✅ Datos de prueba adicionales agregados');
  } catch (error) {
    // No es crítico si falla (puede que ya existan)
    console.log('ℹ️  Los datos de prueba ya pueden existir');
  }
}

/**
 * Limpiar datos de prueba
 */
async function cleanupTestData() {
  try {
    // Solo eliminar registros que claramente son de prueba
    const cleanupSQL = `
      DELETE FROM AD 
      WHERE title LIKE '%Evento Cancelado%' 
         OR title LIKE '%Anuncio Vencido%'
         OR title LIKE '%Nueva Política%'
         OR title LIKE '%Test%'
         OR title LIKE '%Promoción Desactivada%'
    `;
    
    await query(cleanupSQL);
    console.log('🧹 Datos de prueba limpiados');
  } catch (error) {
    // No es crítico si falla la limpieza
    console.log('⚠️  No se pudo limpiar todos los datos de prueba');
  }
}

/**
 * Mostrar resumen de tests
 */
function showTestSummary(passed, failed) {
  console.log('\n🏁 ='.repeat(25));
  console.log('🏁 RESUMEN DE TESTS');
  console.log('🏁 ='.repeat(25));
  
  const total = passed + failed;
  const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
  
  console.log(`📊 Total Tests: ${total}`);
  console.log(`✅ Exitosos: ${passed}`);
  console.log(`❌ Fallidos: ${failed}`);
  console.log(`📈 Tasa de Éxito: ${successRate}%`);
  
  if (failed === 0) {
    console.log('\n🎉 🎉 ¡TODOS LOS TESTS PASARON!');
    console.log('🔒 El filtrado por is_active está funcionando correctamente');
    console.log('✅ La consulta SQL devuelve solo registros activos');
  } else {
    console.log('\n⚠️  ⚠️  ALGUNOS TESTS FALLARON');
    console.log('🔍 Revisar la lógica de filtrado por is_active');
    console.log('🚨 Posible problema en la consulta SQL o estructura de datos');
  }
  
  console.log('\n🏁 ='.repeat(25));
}

// Ejecutar test
if (require.main === module) {
  console.log('🚀 Iniciando QA Test de Filtrado de Anuncios Activos...\n');
  
  testActiveAnnouncementsFilter()
    .then(() => {
      console.log('\n✨ Script finalizado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error.message);
      process.exit(1);
    });
}

module.exports = { testActiveAnnouncementsFilter };
