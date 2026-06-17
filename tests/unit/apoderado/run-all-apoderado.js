/**
 * 🧪 Test Runner - Todos los Tests del Modelo Apoderado
 * 
 * Ejecuta todos los tests unitarios del modelo Apoderado organizados por categoría:
 * - Validaciones
 * - Métodos de instancia
 */

const ApoderadoValidationTests = require('./validaciones.test');
const ApoderadoMethodsTests = require('./metodos.test');

class ApoderadoTestSuite {
  constructor() {
    this.suiteName = '🧪 Suite Completa - Modelo Apoderado';
    this.totalPassed = 0;
    this.totalFailed = 0;
    this.results = [];
  }

  async runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log(this.suiteName);
    console.log('='.repeat(60));
    console.log('📋 Ejecutando tests organizados del modelo Apoderado');
    console.log('🔍 Categorías: Validaciones, Métodos de Instancia');
    console.log('');

    const testSuites = [
      { name: 'Validaciones', class: ApoderadoValidationTests },
      { name: 'Métodos de Instancia', class: ApoderadoMethodsTests }
    ];

    for (const suite of testSuites) {
      console.log(`\n🔵 Ejecutando: ${suite.name}`);
      console.log('-'.repeat(40));

      try {
        const tester = new suite.class();
        const result = await tester.run();
        
        this.totalPassed += result.passed;
        this.totalFailed += result.failed;
        
        this.results.push({
          name: suite.name,
          passed: result.passed,
          failed: result.failed,
          success: result.failed === 0
        });

        if (result.failed === 0) {
          console.log(`✅ ${suite.name}: TODOS LOS TESTS PASARON`);
        } else {
          console.log(`❌ ${suite.name}: ${result.failed} test(s) fallaron`);
        }

      } catch (error) {
        console.error(`💥 Error ejecutando ${suite.name}: ${error.message}`);
        this.totalFailed++;
        this.results.push({
          name: suite.name,
          passed: 0,
          failed: 1,
          success: false,
          error: error.message
        });
      }
    }

    this.showFinalReport();
  }

  showFinalReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE FINAL - MODELO APODERADO');
    console.log('='.repeat(60));

    // Mostrar resumen por categoría
    console.log('\n📋 Resultados por categoría:');
    for (const result of this.results) {
      const status = result.success ? '✅' : '❌';
      const details = result.error ? ` (Error: ${result.error})` : ` (✅${result.passed} ❌${result.failed})`;
      console.log(`${status} ${result.name}${details}`);
    }

    // Mostrar totales
    const totalTests = this.totalPassed + this.totalFailed;
    const successRate = totalTests > 0 ? ((this.totalPassed / totalTests) * 100).toFixed(1) : 0;

    console.log('\n📈 Resumen Global:');
    console.log(`   🧪 Total tests ejecutados: ${totalTests}`);
    console.log(`   ✅ Tests exitosos: ${this.totalPassed}`);
    console.log(`   ❌ Tests fallidos: ${this.totalFailed}`);
    console.log(`   📊 Tasa de éxito: ${successRate}%`);

    // Mensaje final
    if (this.totalFailed === 0) {
      console.log('\n🎉 🎉 ¡TODOS LOS TESTS DEL MODELO APODERADO PASARON! 🎉 🎉');
      console.log('✨ El modelo Apoderado está funcionando correctamente');
    } else {
      console.log('\n⚠️  ⚠️  ALGUNOS TESTS FALLARON ⚠️  ⚠️');
      console.log(`🔍 Revisar los ${this.totalFailed} test(s) que fallaron`);
    }

    console.log('\n' + '='.repeat(60));
  }

  getExitCode() {
    return this.totalFailed > 0 ? 1 : 0;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const suite = new ApoderadoTestSuite();
  
  suite.runAllTests()
    .then(() => {
      console.log('\n✨ Suite de tests Apoderado completada');
      process.exit(suite.getExitCode());
    })
    .catch((error) => {
      console.error('\n💥 Error fatal en suite Apoderado:', error.message);
      process.exit(1);
    });
}

module.exports = ApoderadoTestSuite;
