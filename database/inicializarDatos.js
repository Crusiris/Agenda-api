/**
 * Script de Inicialización de Datos - Agenda Digital Escolar
 * Utiliza Sequelize ORM para poblar MySQL con datos de ejemplo
 */

const { connect, syncModels } = require('./connection');
const { initializeModels } = require('../models');

class BaseDatosEscolar {
  constructor() {
    this.models = null;
  }

  async inicializar() {
    try {
      console.log('📚 Inicializando Base de Datos - Agenda Digital Escolar');
      console.log('🏗️ Implementando arquitectura con MySQL + Sequelize ORM');

      await connect();
      await syncModels(false);
      this.models = initializeModels();

      const docenteCount = await this.models.Docente.count();
      if (docenteCount > 0) {
        console.log('✅ Los datos ya están inicializados');
        return;
      }

      await this.crearDatosEjemplo();
      console.log('✅ Datos inicializados correctamente');
    } catch (error) {
      console.error('❌ Error inicializando datos:', error);
      throw error;
    }
  }

  async crearDatosEjemplo() {
    console.log('📝 Creando datos de ejemplo...');

    const cursos = await this.crearCursos();
    console.log(`🏫 ${cursos.length} cursos creados`);

    const docentes = await this.crearDocentes(cursos);
    console.log(`👨‍🏫 ${docentes.length} docentes creados`);

    const estudiantes = await this.crearEstudiantes(cursos);
    console.log(`🎒 ${estudiantes.length} estudiantes creados`);

    const apoderados = await this.crearApoderados(estudiantes);
    console.log(`👨‍👩‍👧‍👦 ${apoderados.length} apoderados creados`);

    await this.crearContactos(apoderados);
    console.log('📞 Contactos de emergencia creados');

    const reportes = await this.crearReportes(docentes, cursos, estudiantes);
    console.log(`📋 ${reportes.length} reportes de ejemplo creados`);

    const ads = await this.crearAds();
    console.log(`📢 ${ads.length} anuncios de ejemplo creados`);
  }

  async crearCursos() {
    const cursosData = [
      { nombre: '1° Básico A', nivel: '1° Básico',  descripcion: 'Primer año básico, sección A' },
      { nombre: '2° Básico B', nivel: '2° Básico',  descripcion: 'Segundo año básico, sección B' },
      { nombre: '3° Básico A', nivel: '3° Básico',  descripcion: 'Tercer año básico, sección A' },
      { nombre: '4° Básico B', nivel: '4° Básico',  descripcion: 'Cuarto año básico, sección B' },
      { nombre: '5° Básico A', nivel: '5° Básico',  descripcion: 'Quinto año básico, sección A' },
      { nombre: '6° Básico B', nivel: '6° Básico',  descripcion: 'Sexto año básico, sección B' }
    ];

    const cursos = [];
    for (const data of cursosData) {
      cursos.push(await this.models.Curso.create(data));
    }
    return cursos;
  }

  // cursos[0]=1A, [1]=2B, [2]=3A, [3]=4B, [4]=5A, [5]=6B
  async crearDocentes(cursos) {
    const docentesData = [
      {
        rut: '12345678-9',
        nombres: 'María',
        apellidos: 'González Pérez',
        email: 'maria@colegio.cl',
        password: '123456',
        especialidad: 'Matemáticas',
        telefono: '+56987000001',
        _cursos: [cursos[0].id, cursos[1].id]
      },
      {
        rut: '87654321-K',
        nombres: 'Juan',
        apellidos: 'Rodríguez Silva',
        email: 'juan@colegio.cl',
        password: '123456',
        especialidad: 'Lenguaje y Comunicación',
        telefono: '+56987000002',
        _cursos: [cursos[2].id, cursos[3].id]
      },
      {
        rut: '11223344-5',
        nombres: 'Ana',
        apellidos: 'Martínez López',
        email: 'ana.martinez@colegio.cl',
        password: '123456',
        especialidad: 'Ciencias Naturales',
        telefono: '+56987000003',
        _cursos: [cursos[0].id, cursos[2].id]
      },
      {
        rut: '55667788-9',
        nombres: 'Pedro',
        apellidos: 'Sánchez Morales',
        email: 'pedro.sanchez@colegio.cl',
        password: '123456',
        especialidad: 'Educación Física',
        telefono: '+56987000004',
        _cursos: [cursos[4].id, cursos[5].id]
      }
    ];

    const docentes = [];
    for (const { _cursos, ...data } of docentesData) {
      const docente = await this.models.Docente.create(data);
      await docente.setCursos(_cursos);
      docentes.push(docente);
    }
    return docentes;
  }

  // cursos[0]=1A, [1]=2B, [2]=3A, [3]=4B, [4]=5A, [5]=6B
  async crearEstudiantes(cursos) {
    const estudiantesData = [
      { rut: '20456789-1', nombres: 'Sofía',    apellidos: 'Herrera Morales',   cursoId: cursos[0].id, edad: 6,  fechaNacimiento: '2018-03-12' },
      { rut: '21567890-2', nombres: 'Diego',    apellidos: 'Fernández Silva',   cursoId: cursos[2].id, edad: 8,  fechaNacimiento: '2016-07-20' },
      { rut: '22678901-3', nombres: 'Camila',   apellidos: 'Fernández Silva',   cursoId: cursos[4].id, edad: 10, fechaNacimiento: '2014-11-05' },
      { rut: '23789012-4', nombres: 'Matías',   apellidos: 'López Torres',      cursoId: cursos[1].id, edad: 7,  fechaNacimiento: '2017-09-30' },
      { rut: '24890123-5', nombres: 'Valentina',apellidos: 'Muñoz García',      cursoId: cursos[3].id, edad: 9,  fechaNacimiento: '2015-01-18' },
      { rut: '25901234-6', nombres: 'Tomás',    apellidos: 'Castro Vera',       cursoId: cursos[0].id, edad: 6,  fechaNacimiento: '2018-06-25' }
    ];

    const estudiantes = [];
    for (const data of estudiantesData) {
      estudiantes.push(await this.models.Estudiante.create(data));
    }
    return estudiantes;
  }

  // estudiantes[0]=Sofía(1A), [1]=Diego(3A), [2]=Camila(5A),
  //              [3]=Matías(2B), [4]=Valentina(4B), [5]=Tomás(1A)
  async crearApoderados(estudiantes) {
    const apoderadosData = [
      {
        rut: '16789012-3',
        nombres: 'Ana',
        apellidos: 'Morales Jiménez',
        parentesco: 'Madre',
        email: 'ana@email.cl',
        password: '123456',
        telefono: '+56987654321',
        _hijos: [estudiantes[0].id, estudiantes[5].id]  // Sofía y Tomás
      },
      {
        rut: '17890123-4',
        nombres: 'Carlos',
        apellidos: 'Fernández Castro',
        parentesco: 'Padre',
        email: 'carlos@email.cl',
        password: '123456',
        telefono: '+56976543210',
        _hijos: [estudiantes[1].id, estudiantes[2].id]
      },
      {
        rut: '18901234-5',
        nombres: 'Carolina',
        apellidos: 'López Vega',
        parentesco: 'Madre',
        email: 'carolina.lopez@yahoo.com',
        password: '123456',
        telefono: '+56965432109',
        _hijos: [estudiantes[3].id]
      },
      {
        rut: '19012345-6',
        nombres: 'Andrés',
        apellidos: 'Muñoz Rojas',
        parentesco: 'Padre',
        email: 'andres.munoz@gmail.com',
        password: '123456',
        telefono: '+56954321098',
        _hijos: [estudiantes[4].id]
      }
    ];

    const apoderados = [];
    for (const { _hijos, ...data } of apoderadosData) {
      const apoderado = await this.models.Apoderado.create(data);
      await apoderado.setEstudiantes(_hijos);
      apoderados.push(apoderado);
    }
    return apoderados;
  }

  async crearContactos(apoderados) {
    const contactosData = [
      { nombre: 'Juan Carlos Herrera', telefono: '+56987654322', email: 'juan.herrera@gmail.com',  parentesco: 'Padre',   apoderadoId: apoderados[0].id },
      { nombre: 'Abuela Carmen',        telefono: '+56912345678',                                   parentesco: 'Abuela',  apoderadoId: apoderados[0].id },
      { nombre: 'Sandra Silva Pérez',   telefono: '+56976543211', email: 'sandra.silva@gmail.com',  parentesco: 'Madre',   apoderadoId: apoderados[1].id },
      { nombre: 'Miguel Torres López',  telefono: '+56965432108', email: 'miguel.torres@gmail.com', parentesco: 'Padre',   apoderadoId: apoderados[2].id },
      { nombre: 'Lorena García Ruiz',   telefono: '+56954321097', email: 'lorena.garcia@gmail.com', parentesco: 'Madre',   apoderadoId: apoderados[3].id }
    ];

    for (const data of contactosData) {
      await this.models.Contacto.create(data);
    }
  }

  async crearReportes(docentes, cursos, estudiantes) {
    const fechaHoy = new Date();

    const reportesData = [
      {
        docenteId: docentes[0].id,
        cursoId: cursos[0].id,
        tipoReporte: 'asistencia',
        titulo: 'Asistencia diaria — 1° Básico A',
        fecha: fechaHoy,
        contenido: {
          presentes: 28,
          ausentes: 2,
          atrasados: 1,
          estudiantesAusentes: [`${estudiantes[0].nombres} ${estudiantes[0].apellidos}`],
          observaciones: 'Clase normal, buena participación'
        }
      },
      {
        docenteId: docentes[1].id,
        cursoId: cursos[2].id,
        tipoReporte: 'aviso-diario',
        titulo: 'Reunión de Apoderados',
        fecha: fechaHoy,
        contenido: {
          mensaje: 'Se solicita la asistencia de todos los apoderados el próximo viernes a las 19:00 hrs.',
          requiereConfirmacion: true
        }
      },
      {
        docenteId: docentes[2].id,
        cursoId: cursos[1].id,
        estudianteId: estudiantes[3].id,
        tipoReporte: 'reporte-salud',
        titulo: 'Incidente de salud — Matías López',
        fecha: fechaHoy,
        contenido: {
          sintomas: ['dolor de cabeza', 'malestar general'],
          temperatura: 37.2,
          accionesTomadas: 'Se contactó a enfermería y al apoderado',
          requiereSeguimiento: true
        }
      },
      {
        docenteId: docentes[0].id,
        cursoId: cursos[0].id,
        estudianteId: estudiantes[5].id,
        tipoReporte: 'Conducta',
        titulo: 'Conducta — Tomás Castro',
        fecha: fechaHoy,
        contenido: {
          descripcion: 'El estudiante interrumpió la clase en reiteradas ocasiones.',
          severidad: 'leve',
          accionesTomadas: 'Conversación con el alumno. Se notifica al apoderado.',
          requiereEntrevista: false
        }
      },
      {
        docenteId: docentes[1].id,
        cursoId: cursos[2].id,
        tipoReporte: 'Informativo',
        titulo: 'Cambio de sala — 3° Básico A',
        fecha: fechaHoy,
        contenido: {
          texto: 'A partir de la próxima semana las clases de Lenguaje se realizarán en la sala 204.'
        }
      },
      {
        docenteId: docentes[0].id,
        cursoId: cursos[0].id,
        estudianteId: estudiantes[0].id,
        tipoReporte: 'Tarea',
        titulo: 'Tarea de Matemáticas — Sofía Herrera',
        fecha: fechaHoy,
        contenido: {
          descripcion: 'Ejercicios de sumas y restas con llevadas, páginas 34–35 del cuaderno.',
          fechaEntrega: new Date(fechaHoy.getTime() + 3 * 24 * 60 * 60 * 1000)
        }
      },
      {
        docenteId: docentes[3].id,
        cursoId: cursos[4].id,
        tipoReporte: 'Urgente',
        titulo: 'Cierre anticipado — 5° Básico A',
        fecha: fechaHoy,
        contenido: {
          motivo: 'Por corte de agua en el establecimiento se suspenden las clases de la tarde.',
          horaSalida: '13:00',
          instrucciones: 'Retirar a los estudiantes antes de las 13:00 hrs.'
        }
      }
    ];

    const reportes = [];
    for (const data of reportesData) {
      reportes.push(await this.models.ReporteEscolar.create(data));
    }
    return reportes;
  }

  async crearAds() {
    const fechaHoy  = new Date();
    const enUnMes   = new Date(fechaHoy.getTime() + 30 * 24 * 60 * 60 * 1000);
    const enDosM    = new Date(fechaHoy.getTime() + 60 * 24 * 60 * 60 * 1000);

    const adsData = [
      {
        titulo: 'Bienvenidos al Año Escolar 2026',
        descripcion: 'Les damos la bienvenida a todos nuestros estudiantes y familias a un nuevo año escolar lleno de aprendizajes.',
        activo: true,
        fechaInicio: fechaHoy,
        fechaFin: enUnMes
      },
      {
        titulo: 'Matrícula 2027 — Inscripción Abierta',
        descripcion: 'Ya está disponible el proceso de matrícula para el año 2027. Acércate a la secretaría del colegio con la documentación requerida.',
        enlaceUrl: 'https://colegio.cl/matricula',
        activo: true,
        fechaInicio: fechaHoy,
        fechaFin: enDosM
      },
      {
        titulo: 'Taller de Robótica para Estudiantes',
        descripcion: 'Inscripciones abiertas para el taller extraprogramático de robótica los días miércoles de 15:00 a 17:00 hrs.',
        activo: true,
        fechaInicio: fechaHoy,
        fechaFin: enUnMes
      }
    ];

    const ads = [];
    for (const data of adsData) {
      ads.push(await this.models.Ad.create(data));
    }
    return ads;
  }

  async obtenerEstadisticas() {
    try {
      const stats = {
        cursos:      await this.models.Curso.count(),
        docentes:    await this.models.Docente.count(),
        estudiantes: await this.models.Estudiante.count(),
        apoderados:  await this.models.Apoderado.count(),
        contactos:   await this.models.Contacto.count(),
        reportes:    await this.models.ReporteEscolar.count(),
        anuncios:    await this.models.Ad.count()
      };

      console.log('📊 Estadísticas de la Base de Datos:');
      console.log(`   🏫 Cursos:      ${stats.cursos}`);
      console.log(`   👨‍🏫 Docentes:    ${stats.docentes}`);
      console.log(`   🎒 Estudiantes: ${stats.estudiantes}`);
      console.log(`   👨‍👩‍👧‍👦 Apoderados:  ${stats.apoderados}`);
      console.log(`   📞 Contactos:   ${stats.contactos}`);
      console.log(`   📋 Reportes:    ${stats.reportes}`);
      console.log(`   📢 Anuncios:    ${stats.anuncios}`);

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

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
