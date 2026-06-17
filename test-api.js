#!/usr/bin/env node

/**
 * Script de prueba para la API de Agenda
 * Ejecutar con: node test-api.js
 */

const API_BASE = 'http://localhost:3000';

// Función para hacer peticiones HTTP
async function hacerPeticion(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Error en la petición:', error.message);
    return null;
  }
}

// Función para mostrar resultados de prueba
function mostrarResultado(prueba, resultado) {
  console.log(`\n📋 ${prueba}`);
  console.log('━'.repeat(50));
  
  if (resultado) {
    console.log(`Status: ${resultado.status}`);
    console.log('Respuesta:', JSON.stringify(resultado.data, null, 2));
  } else {
    console.log('❌ Error en la petición');
  }
}

// Función principal de pruebas
async function ejecutarPruebas() {
  console.log('🧪 Iniciando pruebas de la API de Agenda\n');
  
  // 1. Probar endpoint principal
  const home = await hacerPeticion(`${API_BASE}/`);
  mostrarResultado('1. Endpoint Principal (/)', home);
  
  // 2. Probar endpoint de salud
  const health = await hacerPeticion(`${API_BASE}/health`);
  mostrarResultado('2. Estado del Sistema (/health)', health);
  
  // 3. Obtener todos los contactos
  const contactos = await hacerPeticion(`${API_BASE}/api/contactos`);
  mostrarResultado('3. Obtener Contactos (GET /api/contactos)', contactos);
  
  // 4. Crear un nuevo contacto
  const nuevoContacto = await hacerPeticion(`${API_BASE}/api/contactos`, {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Ana López',
      telefono: '+1555123456',
      email: 'ana.lopez@example.com'
    })
  });
  mostrarResultado('4. Crear Contacto (POST /api/contactos)', nuevoContacto);
  
  // 5. Obtener contacto por ID (si se creó exitosamente)
  if (nuevoContacto && nuevoContacto.data && nuevoContacto.data.data) {
    const id = nuevoContacto.data.data.id;
    const contactoPorId = await hacerPeticion(`${API_BASE}/api/contactos/${id}`);
    mostrarResultado(`5. Obtener Contacto por ID (GET /api/contactos/${id})`, contactoPorId);
    
    // 6. Actualizar contacto
    const contactoActualizado = await hacerPeticion(`${API_BASE}/api/contactos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        telefono: '+1555999888'
      })
    });
    mostrarResultado(`6. Actualizar Contacto (PUT /api/contactos/${id})`, contactoActualizado);
  }
  
  // 7. Probar error de validación
  const errorValidacion = await hacerPeticion(`${API_BASE}/api/contactos`, {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Pedro'
      // Faltan telefono y email
    })
  });
  mostrarResultado('7. Error de Validación (Campos Faltantes)', errorValidacion);
  
  // 8. Probar ruta no existente
  const rutaInexistente = await hacerPeticion(`${API_BASE}/api/inexistente`);
  mostrarResultado('8. Ruta No Existente (404)', rutaInexistente);
  
  // 9. Documentación de la API
  const docs = await hacerPeticion(`${API_BASE}/api/docs`);
  mostrarResultado('9. Documentación (GET /api/docs)', docs);
  
  console.log('\n✅ Pruebas completadas');
  console.log('\n💡 Tip: Puedes usar herramientas como Postman o curl para hacer más pruebas');
}

// Verificar si el servidor está ejecutándose
async function verificarServidor() {
  console.log('🔍 Verificando si el servidor está ejecutándose...');
  
  try {
    const response = await hacerPeticion(`${API_BASE}/health`);
    if (response && response.status === 200) {
      console.log('✅ Servidor detectado en', API_BASE);
      return true;
    }
  } catch (error) {
    // Ignorar error
  }
  
  console.log('❌ No se pudo conectar al servidor');
  console.log('💡 Asegúrate de que el servidor esté ejecutándose con: npm start');
  return false;
}

// Ejecutar el script
async function main() {
  const servidorActivo = await verificarServidor();
  
  if (servidorActivo) {
    await ejecutarPruebas();
  }
}

// Solo ejecutar si este archivo es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { hacerPeticion, ejecutarPruebas };
