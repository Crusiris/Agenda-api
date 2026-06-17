/**
 * Script para hacer test simple de la API
 */

const http = require('http');

const testEndpoint = (path, description) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ ${description}: OK`);
          resolve(jsonData);
        } catch (error) {
          console.log(`❌ ${description}: Error parsing JSON`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${description}: ${error.message}`);
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ ${description}: Timeout`);
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
};

const runAPITests = async () => {
  console.log('🚀 Iniciando tests de API...\n');

  const tests = [
    { path: '/', description: 'Endpoint principal' },
    { path: '/api/health', description: 'Estado de salud' }
  ];

  let success = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await testEndpoint(test.path, test.description);
      success++;
    } catch (error) {
      failed++;
    }
  }

  console.log(`\n📊 Resultados:`);
  console.log(`✅ Exitosos: ${success}`);
  console.log(`❌ Fallidos: ${failed}`);

  if (failed === 0) {
    console.log('🎉 ¡Todos los tests pasaron!');
  }

  return failed === 0;
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  runAPITests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Error:', error.message);
      process.exit(1);
    });
}

module.exports = runAPITests;
