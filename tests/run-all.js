/**
 * Test Runner Principal - Ejecuta todos los tests organizadamente
 */

const path = require('path');
const { logger } = require('./helpers/config');

// Importar suites de tests
const DocenteModelTests = require('./unit/docente.test');
const ApoderadoModelTests = require('./unit/apoderado.test');
const APIIntegrationTests = require('./integration/api.test');
const E2ETests = require('./e2e/complete-flow.test');

// Importar tests de base de datos existentes
const connectionTestPath = path.join(__dirname, 'database', 'connection.test.js');
const modelsTestPath = path.join(__dirname, 'database', 'models.test.js');

class MasterTestRunner {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, total: 0 },
      integration: { passed: 0, failed: 0, total: 0 },
      database: { passed: 0, failed: 0, total: 0 },
      e2e: { passed: 0, failed: 0, total: 0 }
    };
  }

  async runDatabaseTests() {
    logger.test('🗄️ === TESTS DE BASE DE DATOS ===');
    
    try {
      // Test de conexión
      logger.info('Ejecutando test de conexión...');
      const { execSync } = require('child_process');
      
      try {
        execSync(`node ${connectionTestPath}`, { stdio: 'inherit' });
        this.results.database.passed++;
        logger.success('Test de conexión: PASSED');
      } catch (error) {
        this.results.database.failed++;
        logger.error('Test de conexión: FAILED');
      }
      
      // Test completo de modelos
      logger.info('Ejecutando test completo de modelos...');
      try {
        execSync(`node ${modelsTestPath}`, { stdio: 'inherit' });
        this.results.database.passed++;
        logger.success('Test de modelos: PASSED');
      } catch (error) {
        this.results.database.failed++;
        logger.error('Test de modelos: FAILED');
      }
      
      this.results.database.total = this.results.database.passed + this.results.database.failed;
      
    } catch (error) {
      logger.error(`Error ejecutando tests de BD: ${error.message}`);
    }
  }

  async runUnitTests() {
    logger.test('🧪 === TESTS UNITARIOS ===');
    
    const unitTests = [
      { name: 'Modelo Docente', suite: DocenteModelTests },
      { name: 'Modelo Apoderado', suite: ApoderadoModelTests }
    ];

    for (const test of unitTests) {
      try {
        logger.info(`Ejecutando ${test.name}...`);
        const testInstance = new test.suite();
        const success = await testInstance.runTests();
        
        if (success) {
          this.results.unit.passed++;
          logger.success(`${test.name}: PASSED`);
        } else {
          this.results.unit.failed++;
          logger.error(`${test.name}: FAILED`);
        }
      } catch (error) {
        this.results.unit.failed++;
        logger.error(`${test.name}: ERROR - ${error.message}`);
      }
    }
    
    this.results.unit.total = this.results.unit.passed + this.results.unit.failed;
  }

  async runIntegrationTests() {
    logger.test('🔗 === TESTS DE INTEGRACIÓN ===');
    
    try {
      logger.info('Ejecutando tests de API...');
      const apiTests = new APIIntegrationTests();
      const success = await apiTests.runTests();
      
      if (success) {
        this.results.integration.passed++;
        logger.success('Tests de API: PASSED');
      } else {
        this.results.integration.failed++;
        logger.error('Tests de API: FAILED');
      }
    } catch (error) {
      this.results.integration.failed++;
      logger.error(`Tests de API: ERROR - ${error.message}`);
    }
    
    this.results.integration.total = this.results.integration.passed + this.results.integration.failed;
  }

  async runE2ETests() {
    logger.test('🎭 === TESTS END-TO-END ===');
    
    try {
      logger.info('Ejecutando tests E2E completos...');
      const e2eTests = new E2ETests();
      const success = await e2eTests.runTests();
      
      if (success) {
        this.results.e2e.passed++;
        logger.success('Tests E2E: PASSED');
      } else {
        this.results.e2e.failed++;
        logger.error('Tests E2E: FAILED');
      }
    } catch (error) {
      this.results.e2e.failed++;
      logger.error(`Tests E2E: ERROR - ${error.message}`);
    }
    
    this.results.e2e.total = this.results.e2e.passed + this.results.e2e.failed;
  }

  printFinalReport() {
    console.log('\n' + '='.repeat(60));
    logger.test('📊 REPORTE FINAL DE TESTS');
    console.log('='.repeat(60));

    const categories = [
      { name: 'Base de Datos', key: 'database', icon: '🗄️' },
      { name: 'Unitarios', key: 'unit', icon: '🧪' },
      { name: 'Integración', key: 'integration', icon: '🔗' },
      { name: 'End-to-End', key: 'e2e', icon: '🎭' }
    ];

    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;

    categories.forEach(category => {
      const result = this.results[category.key];
      const percentage = result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : '0.0';
      
      console.log(`${category.icon} ${category.name}:`);
      console.log(`   ✅ Passed: ${result.passed}`);
      console.log(`   ❌ Failed: ${result.failed}`);
      console.log(`   📈 Success Rate: ${percentage}%`);
      console.log('');

      totalPassed += result.passed;
      totalFailed += result.failed;
      totalTests += result.total;
    });

    console.log('='.repeat(60));
    console.log('🏆 RESUMEN GLOBAL:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${totalPassed}`);
    console.log(`   ❌ Failed: ${totalFailed}`);
    
    const globalPercentage = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';
    console.log(`   📈 Global Success Rate: ${globalPercentage}%`);

    if (totalFailed === 0) {
      logger.success('🎉 ¡TODOS LOS TESTS PASARON!');
    } else {
      logger.warning(`⚠️ ${totalFailed} test(s) fallaron. Revisar logs para detalles.`);
    }

    console.log('='.repeat(60));

    return totalFailed === 0;
  }

  async runAllTests(options = {}) {
    const startTime = Date.now();
    
    logger.test('🚀 INICIANDO SUITE COMPLETA DE TESTS');
    logger.test('=====================================\n');

    try {
      // Ejecutar tests en orden lógico
      if (options.database !== false) {
        await this.runDatabaseTests();
      }
      
      if (options.unit !== false) {
        await this.runUnitTests();
      }
      
      if (options.integration !== false) {
        await this.runIntegrationTests();
      }
      
      if (options.e2e !== false) {
        await this.runE2ETests();
      }

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      console.log(`\n⏱️ Tiempo total de ejecución: ${duration}s\n`);
      
      return this.printFinalReport();

    } catch (error) {
      logger.error(`Error crítico ejecutando tests: ${error.message}`);
      return false;
    }
  }

  async runCategory(category) {
    logger.test(`🎯 Ejecutando solo tests de: ${category.toUpperCase()}`);
    
    switch (category) {
      case 'database':
      case 'db':
        await this.runDatabaseTests();
        break;
      case 'unit':
        await this.runUnitTests();
        break;
      case 'integration':
        await this.runIntegrationTests();
        break;
      case 'e2e':
        await this.runE2ETests();
        break;
      default:
        logger.error(`Categoría desconocida: ${category}`);
        logger.info('Categorías disponibles: database, unit, integration, e2e');
        return false;
    }
    
    return this.printFinalReport();
  }
}

// CLI para ejecutar tests
const runCLI = async () => {
  const args = process.argv.slice(2);
  const runner = new MasterTestRunner();
  
  if (args.length === 0) {
    // Ejecutar todos los tests
    const success = await runner.runAllTests();
    process.exit(success ? 0 : 1);
  } else {
    // Ejecutar categoría específica
    const category = args[0];
    const success = await runner.runCategory(category);
    process.exit(success ? 0 : 1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  runCLI().catch(error => {
    logger.error(`Error ejecutando CLI: ${error.message}`);
    process.exit(1);
  });
}

module.exports = MasterTestRunner;
