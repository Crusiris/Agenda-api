/**
 * 🧪 Test Runner Maestro - Todos los Tests Unitarios
 * 
 * Ejecuta todos los tests unitarios organizados:
 * - Tests del modelo Docente (validaciones, métodos, estáticos)  
 * - Tests del modelo Apoderado (validaciones, métodos)
 */

const DocenteTestSuite = require('./docente/run-all-docente');
const ApoderadoTestSuite = require('./apoderado/run-all-apoderado');

class UnitTestMasterSuite {
  constructor() {
    this.suiteName = '🏆 Suite Maestra - Todos los Tests Unitarios';
    this.totalPassed = 0;
    this.totalFailed = 0;
    this.modelResults = [];
  }

  async runAllUnitTests() {
    console.log('\n' + '='.repeat(70));
    console.log(this.suiteName);
    console.log('='.repeat(70));
    console.log('🎯 Ejecutando TODOS los tests unitarios del proyecto');
    console.log('📦 Modelos: Docente, Apoderado');
    console.log('🗂️  Tests organizados por carpetas y categorías');
    console.log('');

    const suites = [
      { name: 'Modelo Docente', class: DocenteTestSuite },
      { name: 'Modelo Apoderado', class: ApoderadoTestSuite }
    ];

    for (const suite of suites) {
      console.log(`\n🚀 Iniciando tests: ${suite.name}`);
      console.log('='.repeat(50));

      try {
        const testSuite = new suite.class();
        
        // Capturar salida para obtener estadísticas
        const originalLog = console.log;
        let output = '';
        console.log = (...args) => {
          output += args.join(' ') + '\n';
          originalLog(...args);
        };

        await testSuite.runAllTests();
        
        // Restaurar console.log
        console.log = originalLog;

        // Obtener estadísticas del suite
        const stats = this.extractStats(testSuite);
        this.totalPassed += stats.passed;
        this.totalFailed += stats.failed;

        this.modelResults.push({
          name: suite.name,
          passed: stats.passed,
          failed: stats.failed,
          success: stats.failed === 0,
          categories: stats.categories || []
        });

        if (stats.failed === 0) {
          console.log(`\n✨ ${suite.name}: ¡TODOS LOS TESTS EXITOSOS! ✨`);
        } else {
          console.log(`\n⚠️  ${suite.name}: ${stats.failed} test(s) fallaron`);
        }

      } catch (error) {
        console.error(`\n💥 Error crítico en ${suite.name}: ${error.message}`);
        this.totalFailed++;
        this.modelResults.push({
          name: suite.name,
          passed: 0,
          failed: 1,
          success: false,
          error: error.message
        });
      }
    }

    this.showMasterReport();
  }

  extractStats(testSuite) {
    return {
      passed: testSuite.totalPassed || 0,
      failed: testSuite.totalFailed || 0,
      categories: testSuite.results || []
    };
  }

  showMasterReport() {
    console.log('\n' + '='.repeat(70));
    console.log('🏆 REPORTE MAESTRO - TODOS LOS TESTS UNITARIOS');
    console.log('='.repeat(70));

    // Mostrar resumen por modelo
    console.log('\n📦 Resultados por modelo:');
    for (const result of this.modelResults) {
      const status = result.success ? '🟢' : '🔴';
      const details = result.error ? 
        ` - ERROR: ${result.error}` : 
        ` - ✅ ${result.passed} / ❌ ${result.failed}`;
      
      console.log(`${status} ${result.name}${details}`);
      
      // Mostrar categorías si están disponibles
      if (result.categories && result.categories.length > 0) {
        for (const category of result.categories) {
          const catStatus = category.success ? '  ✅' : '  ❌';
          console.log(`${catStatus} ${category.name} (✅${category.passed} ❌${category.failed})`);
        }
      }
    }

    // Estadísticas globales
    const totalTests = this.totalPassed + this.totalFailed;
    const successRate = totalTests > 0 ? ((this.totalPassed / totalTests) * 100).toFixed(1) : 0;
    const modelsSuccess = this.modelResults.filter(r => r.success).length;
    const totalModels = this.modelResults.length;

    console.log('\n📊 Estadísticas Globales:');
    console.log(`   🧪 Total tests ejecutados: ${totalTests}`);
    console.log(`   ✅ Tests exitosos: ${this.totalPassed}`);
    console.log(`   ❌ Tests fallidos: ${this.totalFailed}`);
    console.log(`   📈 Tasa de éxito: ${successRate}%`);
    console.log(`   📦 Modelos exitosos: ${modelsSuccess}/${totalModels}`);

    // Mensaje final épico
    console.log('\n' + '🎯'.repeat(20));
    if (this.totalFailed === 0) {
      console.log('🎉 ¡¡¡ VICTORIA TOTAL !!! 🎉');
      console.log('✨ TODOS LOS TESTS UNITARIOS PASARON ✨');
      console.log('🏆 Los modelos Docente y Apoderado funcionan perfectamente');
      console.log('🚀 ¡El código está listo para producción!');
    } else {
      console.log('⚡ RESUMEN DE BATALLA ⚡');
      console.log(`💪 ${this.totalPassed} tests conquistados`);
      console.log(`🎯 ${this.totalFailed} desafíos por resolver`);
      console.log('🔧 ¡Tiempo de debuggear y conquistar el resto!');
    }
    console.log('🎯'.repeat(20));

    console.log('\n' + '='.repeat(70));
  }

  getExitCode() {
    return this.totalFailed > 0 ? 1 : 0;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const masterSuite = new UnitTestMasterSuite();
  
  console.log('🚀 Iniciando Suite Maestra de Tests Unitarios...');
  
  masterSuite.runAllUnitTests()
    .then(() => {
      console.log('\n🏁 Suite Maestra completada');
      process.exit(masterSuite.getExitCode());
    })
    .catch((error) => {
      console.error('\n💥 Error fatal en Suite Maestra:', error.message);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    });
}

module.exports = UnitTestMasterSuite;
