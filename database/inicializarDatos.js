/**
 * Script de Inicialización de Datos - Agenda Digital Escolar
 * Utiliza Sequelize ORM para poblar MySQL con datos de ejemplo
 */

const { connect, syncModels, getInstance } = require('./connection');
const { initializeModels } = require('../models');

class BaseDatosEscolar {
  constructor() {
    this.models = null;
  }

  async inicializar() {
    try {
      console.log('📚 Inicializando Base de Datos - Agenda Digital Escolar');
      console.log('🏗️ Implementando arquitectura con MySQL + Sequelize ORM');
      
      // Conectar a la base de datos
      await connect();
      
      // Sincronizar modelos (crear tablas)
      await syncModels(false); // false = no eliminar datos existentes
      
      // Inicializar modelos
      this.models = initializeModels();
      
      // Verificar si ya existen datos
      const docenteCount = await this.models.Docente.count();
      if (docenteCount > 0) {
        console.log('✅ Los datos ya están inicializados');
        return;
      }
      
      // Crear datos de ejemplo
      await this.crearDatosEjemplo();
      
      console.log('✅ Datos inicializados correctamente');
    } catch (error) {
      console.error('❌ Error inicializando datos:', error);
      throw error;
    }
  }

  async crearDatosEjemplo() {
    console.log('📝 Creando datos de ejemplo...');
    
    // Crear docentes
    const docentes = await this.crearDocentes();
    console.log(`👨‍🏫 ${docentes.length} docentes creados`);
    
    // Crear apoderados
    const apoderados = await this.crearApoderados();
    console.log(`👨‍👩‍👧‍👦 ${apoderados.length} apoderados creados`);
    
    // Crear contactos para los apoderados
    await this.crearContactos(apoderados);
    console.log('📞 Contactos de emergencia creados');
    
    // Crear reportes de ejemplo
    const reportes = await this.crearReportes(docentes);
    console.log(`📋 ${reportes.length} reportes de ejemplo creados`);
  }

  async crearDocentes() {
    const docentesData = [
      {
        rut: '12345678-9',
        nombre: 'María González Pérez',
        email: 'maria.gonzalez@colegio.cl',
        password: '123456',
        cursos: ['1A', '2B'],
        asignatura: 'Matemáticas',
        esProfesorJefe: true
      },
      {
        rut: '87654321-K',
        nombre: 'Carlos Rodríguez Silva',
        email: 'carlos.rodriguez@colegio.cl',
        password: '123456',
        cursos: ['3A', '4B'],
        asignatura: 'Lenguaje y Comunicación',
        esProfesorJefe: true
      },
      {
        rut: '11223344-5',
        nombre: 'Ana Martínez López',
        email: 'ana.martinez@colegio.cl',
        password: '123456',
        cursos: ['1A', '2A', '3A'],
        asignatura: 'Ciencias Naturales',
        esProfesorJefe: false
      },
      {
        rut: '55667788-9',
        nombre: 'Pedro Sánchez Morales',
        email: 'pedro.sanchez@colegio.cl',
        password: '123456',
        cursos: ['5A', '6B'],
        asignatura: 'Educación Física',
        esProfesorJefe: false
      }
    ];

    const docentes = [];
    for (const data of docentesData) {
      const docente = await this.models.Docente.create(data);
      docentes.push(docente);
    }
    
    return docentes;
  }

  async crearApoderados() {
    const apoderadosData = [
      {
        rut: '16789012-3',
        nombre: 'Patricia Morales Jiménez',
        email: 'patricia.morales@gmail.com',
        password: '123456',
        telefono: '+56987654321',
        hijos: [
          {
            nombre: 'Sofía Herrera Morales',
            rut: '20456789-1',
            curso: '1A',
            edad: 6
          }
        ]
      },
      {
        rut: '17890123-4',
        nombre: 'Roberto Fernández Castro',
        email: 'roberto.fernandez@outlook.com',
        password: '123456',
        telefono: '+56976543210',
        hijos: [
          {
            nombre: 'Diego Fernández Silva',
            rut: '21567890-2',
            curso: '3A',
            edad: 8
          },
          {
            nombre: 'Camila Fernández Silva',
            rut: '22678901-3',
            curso: '5A',
            edad: 10
          }
        ]
      },
      {
        rut: '18901234-5',
        nombre: 'Carolina López Vega',
        email: 'carolina.lopez@yahoo.com',
        password: '123456',
        telefono: '+56965432109',
        hijos: [
          {
            nombre: 'Matías López Torres',
            rut: '23789012-4',
            curso: '2B',
            edad: 7
          }
        ]
      },
      {
        rut: '19012345-6',
        nombre: 'Andrés Muñoz Rojas',
        email: 'andres.munoz@gmail.com',
        password: '123456',
        telefono: '+56954321098',
        hijos: [
          {
            nombre: 'Valentina Muñoz García',
            rut: '24890123-5',
            curso: '4B',
            edad: 9
          }
        ]
      }
    ];

    const apoderados = [];
    for (const data of apoderadosData) {
      const apoderado = await this.models.Apoderado.create(data);
      apoderados.push(apoderado);
    }
    
    return apoderados;
  }

  async crearContactos(apoderados) {
    const contactosData = [
      // Contactos para Patricia Morales
      {
        nombre: 'Juan Carlos Herrera',
        telefono: '+56987654322',
        email: 'juan.herrera@gmail.com',
        tipo: 'principal',
        relacion: 'Padre',
        apoderadoId: apoderados[0].id
      },
      {
        nombre: 'Abuela Carmen',
        telefono: '+56912345678',
        tipo: 'emergencia',
        relacion: 'Abuela',
        apoderadoId: apoderados[0].id
      },
      // Contactos para Roberto Fernández
      {
        nombre: 'Sandra Silva Pérez',
        telefono: '+56976543211',
        email: 'sandra.silva@gmail.com',
        tipo: 'principal',
        relacion: 'Madre',
        apoderadoId: apoderados[1].id
      },
      // Contactos para Carolina López
      {
        nombre: 'Miguel Torres López',
        telefono: '+56965432108',
        email: 'miguel.torres@gmail.com',
        tipo: 'principal',
        relacion: 'Padre',
        apoderadoId: apoderados[2].id
      },
      // Contactos para Andrés Muñoz
      {
        nombre: 'Lorena García Ruiz',
        telefono: '+56954321097',
        email: 'lorena.garcia@gmail.com',
        tipo: 'principal',
        relacion: 'Madre',
        apoderadoId: apoderados[3].id
      }
    ];

    for (const data of contactosData) {
      await this.models.Contacto.create(data);
    }
  }

  async crearReportes(docentes) {
    const fechaHoy = new Date().toISOString().split('T')[0];
    
    const reportesData = [
      {
        tipo: 'asistencia',
        curso: '1A',
        docenteId: docentes[0].id,
        fechaReporte: fechaHoy,
        contenido: {
          fecha: fechaHoy,
          presentes: 28,
          ausentes: 2,
          atrasados: 1,
          estudiantesAusentes: ['Sofía Herrera Morales'],
          observaciones: 'Clase normal, buena participación'
        }
      },
      {
        tipo: 'aviso-diario',
        curso: '3A',
        docenteId: docentes[1].id,
        fechaReporte: fechaHoy,
        contenido: {
          titulo: 'Reunión de Apoderados',
          mensaje: 'Se solicita la asistencia de todos los apoderados para la reunión del próximo viernes 15 de noviembre a las 19:00 hrs.',
          fechaVencimiento: '2024-11-15',
          requiereConfirmacion: true
        }
      },
      {
        tipo: 'reporte-salud',
        curso: '2B',
        docenteId: docentes[2].id,
        fechaReporte: fechaHoy,
        contenido: {
          estudiante: 'Matías López Torres',
          sintomas: ['dolor de cabeza', 'malestar general'],
          temperatura: 37.2,
          accionesTomadas: 'Se contactó a enfermería y se comunicó con el apoderado',
          requiereSeguimiento: true,
          contactoApoderado: true
        }
      }
    ];

    const reportes = [];
    for (const data of reportesData) {
      const reporte = await this.models.ReporteEscolar.create(data);
      reportes.push(reporte);
    }
    
    return reportes;
  }

  // Método para obtener estadísticas de la base de datos
  async obtenerEstadisticas() {
    try {
      const stats = {
        docentes: await this.models.Docente.count(),
        apoderados: await this.models.Apoderado.count(),
        contactos: await this.models.Contacto.count(),
        reportes: await this.models.ReporteEscolar.count(),
        reportesUrgentes: await this.models.ReporteEscolar.count({
          where: { prioridad: 'urgente' }
        })
      };
      
      console.log('📊 Estadísticas de la Base de Datos:');
      console.log(`   👨‍🏫 Docentes: ${stats.docentes}`);
      console.log(`   👨‍👩‍👧‍👦 Apoderados: ${stats.apoderados}`);
      console.log(`   📞 Contactos: ${stats.contactos}`);
      console.log(`   📋 Reportes: ${stats.reportes}`);
      console.log(`   🚨 Reportes Urgentes: ${stats.reportesUrgentes}`);
      
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Función principal para inicializar
const inicializarBaseDatos = async () => {
  const baseDatos = new BaseDatosEscolar();
  await baseDatos.inicializar();
  await baseDatos.obtenerEstadisticas();
  return baseDatos;
};

module.exports = {
  BaseDatosEscolar,
  inicializarBaseDatos
};
