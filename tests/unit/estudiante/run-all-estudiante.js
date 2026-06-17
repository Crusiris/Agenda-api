/**
 * Runner para todos los tests de Estudiante
 */

const EstudianteValidationTests = require('./validaciones.test');
const EstudianteMetodosTests    = require('./metodos.test');

const runAllEstudianteTests = async () => {
  console.log('\n🎒 ═══════════════════════════════════════');
  console.log('  Tests Unitarios — Modelo Estudiante');
  console.log('═══════════════════════════════════════\n');

  const suites = [
    { name: 'Validaciones', Class: EstudianteValidationTests },
    { name: 'Métodos',      Class: EstudianteMetodosTests }
  ];

  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of suites) {
    try {
      const instance = new suite.Class();
      const result = await instance.run();
      totalPassed += result.passed || 0;
      totalFailed += result.failed || 0;
    } catch (error) {
      console.error(`\n❌ Error en suite ${suite.name}:`, error.message);
      totalFailed++;
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`  Estudiante — Resultado Final`);
  console.log(`  ✅ Pasaron: ${totalPassed}  ❌ Fallaron: ${totalFailed}`);
  console.log('═══════════════════════════════════════\n');

  return { passed: totalPassed, failed: totalFailed };
};

if (require.main === module) {
  runAllEstudianteTests()
    .then(r => process.exit(r.failed > 0 ? 1 : 0))
    .catch(error => {
      console.error('Error inesperado:', error);
      process.exit(1);
    });
}

module.exports = { runAllEstudianteTests };
