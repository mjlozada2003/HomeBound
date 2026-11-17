import { crearHallazgo } from '../models/Posts/hallazgo';
import { crearPerdida, esCategoriaOtro } from '../models/Posts/perdida';
import { crearEnlaceMapa, obtenerFechaLocal } from '../models/Posts/reglasPublicacion';
import { crearUrlMapaEmbebido, formatearCoordenadas } from '../models/Posts/mapa';
import { asignarAutor } from '../models/Posts/misPublicaciones';
import { guardarHallazgo } from '../services/hallazgoService';
import { guardarPerdida } from '../services/perdidaService';
import { tieneDatosIngresados, crearBorrador, claveBorrador } from '../models/Posts/borrador';
import { guardarBorrador, obtenerBorrador, eliminarBorrador } from '../services/borradorService';
import { pedirDecisionSalida } from './dialogoConfirmacion';

import {
  obtenerSesionActiva,
  puedeAccederAPublicar
} from '../models/Auth/sesion';

const ENLACE_GOOGLE_MAPS = 'https://www.google.com/maps';
const RETARDO_VISTA_PREVIA_MS = 600;

const MENSAJES_UBICACION = {
  buscando: 'Obteniendo tu ubicación…',
  encontrada: 'Ubicación marcada. Revisa el mapa y ajústala si hace falta.',
  error: 'No pudimos obtener tu ubicación. Escribe una dirección o pega un enlace de Google Maps.'
};

const MENSAJES_HALLAZGO = {
  exito: 'Hallazgo enviado. Pendiente de revisión.',
  errorAlGuardar: 'No se pudo enviar el hallazgo. Conservamos tus datos para que lo intentes de nuevo.',
  sinSesion: 'Debes iniciar sesión para publicar un hallazgo.',
  enviando: 'Enviando hallazgo…'
};

const MENSAJES_PERDIDA = {
  exito: 'Pérdida enviada. Pendiente de revisión.',
  errorAlGuardar: 'No se pudo enviar la pérdida. Conservamos tus datos para que lo intentes de nuevo.',
  sinSesion: 'Debes iniciar sesión para publicar una pérdida.',
  enviando: 'Enviando pérdida…'
};

async function enviarPublicacion({ datos, crear, guardar, hoy, mensajes }) {
  const resultado = crear(datos, hoy);
  if (!resultado.esValido) {
    return resultado;
  }
  try {
    const publicacion = await guardar(resultado.publicacion);
    return { esValido: true, mensaje: mensajes.exito, publicacion };
  } catch {
    return { esValido: false, mensaje: mensajes.errorAlGuardar };
  }
}

export function enviarHallazgo(datos, guardar = guardarHallazgo, hoy = new Date()) {
  return enviarPublicacion({ datos, crear: crearHallazgo, guardar, hoy, mensajes: MENSAJES_HALLAZGO });
}

export function enviarPerdida(datos, guardar = guardarPerdida, hoy = new Date()) {
  return enviarPublicacion({ datos, crear: crearPerdida, guardar, hoy, mensajes: MENSAJES_PERDIDA });
}

function mostrarEnlace(elemento, enlace) {
  elemento.hidden = !enlace;
  if (enlace) {
    elemento.href = enlace;
  } else {
    elemento.removeAttribute('href');
  }
}

function mostrarMensajeEstado(elemento, tipo, texto) {
  elemento.className = tipo;
  elemento.textContent = texto;
}

function mostrarFotosDelResumen(contenedor, publicacion) {
  contenedor.replaceChildren();
  for (const urlFoto of publicacion.fotos) {
    const imagen = document.createElement('img');
    imagen.src = urlFoto;
    imagen.alt = publicacion.titulo;
    contenedor.append(imagen);
  }
}

function mostrarResumen(campo, publicacion) {
  const { contacto, ubicacion } = publicacion;

  campo('resumen-titulo').textContent = publicacion.titulo;
  campo('resumen-detalles').textContent = publicacion.descripcion;
  mostrarFotosDelResumen(campo('resumen-fotos'), publicacion);

  mostrarEnlace(campo('contacto-whatsapp'), contacto.enlaceWhatsapp);
  mostrarEnlace(campo('contacto-correo'), contacto.enlaceCorreo);
  campo('contacto-whatsapp').textContent = 'WhatsApp: +' + contacto.whatsapp;
  campo('contacto-correo').textContent = contacto.correo;

  mostrarEnlace(campo('resumen-maps'), ubicacion.enlace);
  campo('resumen').hidden = false;
}

// Campo del borrador -> sufijo del id del input en el formulario.
const CAMPOS_DEL_BORRADOR = {
  categoria: 'categoria',
  titulo: 'nombre',
  descripcion: 'descripcion',
  fecha: 'fecha',
  ubicacion: 'ubicacion',
  whatsapp: 'whatsapp',
  correo: 'correo',
  categoriaOtra: 'categoria-otra'
};

function rellenarFormulario(campo, borrador) {
  for (const [clave, sufijo] of Object.entries(CAMPOS_DEL_BORRADOR)) {
    const input = campo(sufijo);
    if (input && typeof borrador[clave] === 'string') {
      input.value = borrador[clave];
    }
  }
}

function leerDatosComunes(campo) {
  return {
    categoria: campo('categoria').value,
    titulo: campo('nombre').value,
    descripcion: campo('descripcion').value,
    fecha: campo('fecha').value,
    fotos: Array.from(campo('fotos').files),
    ubicacion: campo('ubicacion').value,
    whatsapp: campo('whatsapp').value,
    correo: campo('correo').value
  };
}

// HU-14: vista previa del mapa con el marcador de la ubicación ingresada.
function iniciarVistaPreviaMapa(campo) {
  const contenedor = campo('mapa-vista');
  const iframe = campo('mapa');
  let temporizador = null;

  const mostrar = (url) => {
    if (!contenedor || !iframe) {
      return;
    }
    contenedor.hidden = !url;
    if (url && iframe.getAttribute('src') !== url) {
      iframe.src = url;
    } else if (!url) {
      iframe.removeAttribute('src');
    }
  };

  return {
    // Espera a que la persona deje de escribir para no recargar el mapa en cada tecla.
    actualizar() {
      clearTimeout(temporizador);
      temporizador = setTimeout(
        () => mostrar(crearUrlMapaEmbebido(campo('ubicacion').value)),
        RETARDO_VISTA_PREVIA_MS
      );
    },
    limpiar() {
      clearTimeout(temporizador);
      mostrar('');
      const estado = campo('ubicacion-estado');
      if (estado) {
        estado.textContent = '';
      }
    }
  };
}

// HU-14: marca la ubicación actual del dispositivo como coordenadas.
function iniciarBotonMiUbicacion(campo, alCambiarUbicacion) {
  const boton = campo('mi-ubicacion');
  const estado = campo('ubicacion-estado');
  if (!boton) {
    return;
  }
  const mostrarEstado = (texto) => {
    if (estado) {
      estado.textContent = texto;
    }
  };

  if (!window.navigator?.geolocation) {
    boton.hidden = true;
    return;
  }

  boton.addEventListener('click', () => {
    boton.disabled = true;
    mostrarEstado(MENSAJES_UBICACION.buscando);
    window.navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        campo('ubicacion').value = formatearCoordenadas(coords.latitude, coords.longitude);
        mostrarEstado(MENSAJES_UBICACION.encontrada);
        boton.disabled = false;
        alCambiarUbicacion();
      },
      () => {
        mostrarEstado(MENSAJES_UBICACION.error);
        boton.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
}

// Comportamiento compartido por los formularios de hallazgo y pérdida.
function iniciarFormularioPublicacion({
  prefijo,
  enviar,
  guardar,
  ahora,
  mensajes,
  leerDatosAdicionales = () => ({}),
  alReiniciarFormulario = () => {},
  alVolver = () => {}
}) {
  const formulario = document.querySelector('#' + prefijo + '-form');
  if (!formulario) {
    return null;
  }

  const campo = (nombre) => document.querySelector('#' + prefijo + '-' + nombre);
  const botonEnviar = campo('enviar');
  const mensajeEstado = campo('mensaje');
  let estaEnviando = false;

  const actualizarFechaMaxima = () => {
    campo('fecha').max = obtenerFechaLocal(ahora());
  };

  actualizarFechaMaxima();
  formulario.addEventListener('focusin', actualizarFechaMaxima);

  const vistaMapa = iniciarVistaPreviaMapa(campo);

  const actualizarEnlaceMapa = () => {
    campo('maps').href = crearEnlaceMapa(campo('ubicacion').value) || ENLACE_GOOGLE_MAPS;
    vistaMapa.actualizar();
  };
  campo('ubicacion').addEventListener('input', actualizarEnlaceMapa);
  iniciarBotonMiUbicacion(campo, actualizarEnlaceMapa);

  const leerDatos = () => ({ ...leerDatosComunes(campo), ...leerDatosAdicionales(campo) });
  const claveDelUsuario = () => claveBorrador(prefijo, obtenerSesionActiva());

  const limpiarFormulario = () => {
    formulario.reset();
    alReiniciarFormulario();
    campo('maps').href = ENLACE_GOOGLE_MAPS;
    vistaMapa.limpiar();
    mostrarMensajeEstado(mensajeEstado, '', '');
    campo('resumen').hidden = true;
  };

  // Si el usuario tiene un borrador y el formulario está vacío, lo vuelve a llenar.
  const restaurarBorrador = () => {
    if (!obtenerSesionActiva() || tieneDatosIngresados(leerDatos())) {
      return;
    }
    const borrador = obtenerBorrador(claveDelUsuario());
    if (!borrador) {
      return;
    }
    rellenarFormulario(campo, borrador);
    alReiniciarFormulario();
    actualizarEnlaceMapa();
    mostrarMensajeEstado(
      mensajeEstado,
      'exito',
      'Recuperamos tu borrador. Vuelve a elegir las fotos antes de enviar.'
    );
  };

  restaurarBorrador();

  campo('volver').addEventListener('click', async () => {
    const datos = leerDatos();
    if (!tieneDatosIngresados(datos)) {
      alVolver();
      return;
    }
    const decision = await pedirDecisionSalida();
    if (decision === 'borrador') {
      guardarBorrador(claveDelUsuario(), crearBorrador(datos));
      alVolver();
    } else if (decision === 'descartar') {
      eliminarBorrador(claveDelUsuario());
      limpiarFormulario();
      alVolver();
    }
  });

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (estaEnviando) {
      return;
    }
    if (!puedeAccederAPublicar(obtenerSesionActiva())) {
      mostrarMensajeEstado(mensajeEstado, 'error', mensajes.sinSesion);
      return;
    }

    const datos = leerDatos();

    estaEnviando = true;
    botonEnviar.disabled = true;
    mostrarMensajeEstado(mensajeEstado, '', mensajes.enviando);
    campo('resumen').hidden = true;

    try {
      const guardarConAutor = (publicacion) =>
        guardar(asignarAutor(publicacion, obtenerSesionActiva()));
      const resultado = await enviar(datos, guardarConAutor, ahora());
      mostrarMensajeEstado(mensajeEstado, resultado.esValido ? 'exito' : 'error', resultado.mensaje);

      if (resultado.esValido) {
        eliminarBorrador(claveDelUsuario());
        mostrarResumen(campo, resultado.publicacion);
        formulario.reset();
        alReiniciarFormulario();
        campo('maps').href = ENLACE_GOOGLE_MAPS;
        vistaMapa.limpiar();
      }
    } finally {
      estaEnviando = false;
      botonEnviar.disabled = false;
      actualizarFechaMaxima();
    }
  });

  return { campo, actualizarFechaMaxima, restaurarBorrador };
}

function iniciarFormularioHallazgo(guardar, ahora, alVolver) {
  const formularioHallazgo = iniciarFormularioPublicacion({
    prefijo: 'hallazgo',
    enviar: enviarHallazgo,
    guardar,
    ahora,
    mensajes: MENSAJES_HALLAZGO,
    alVolver
  });

  // Al entrar a publicar (por ejemplo, después de iniciar sesión) se recupera el borrador.
  if (formularioHallazgo) {
    document
      .querySelector('#nav-btn-publicar')
      .addEventListener('click', formularioHallazgo.restaurarBorrador);
  }
}

function iniciarNavegacionEntreFormularios(formularioPerdida) {
  const { campo, actualizarFechaMaxima, restaurarBorrador } = formularioPerdida;

  document.querySelector('#hallazgo-ir-perdida').addEventListener('click', () => {
    if (!puedeAccederAPublicar(obtenerSesionActiva())) {
      document.querySelector('#nav-btn-ingresar').click();
      return;
    }
    document.querySelector('#hallazgo-seccion').classList.add('oculto');
    campo('seccion').classList.remove('oculto');
    actualizarFechaMaxima();
    restaurarBorrador();
    campo('categoria').focus();
  });

  document.querySelector('#perdida-ir-hallazgo').addEventListener('click', () => {
    document.querySelector('#nav-btn-publicar').click();
  });
}

function iniciarFormularioPerdida(guardar, ahora, alVolver) {
  const campo = (nombre) => document.querySelector('#perdida-' + nombre);

  const actualizarCategoriaOtra = () => {
    const eligioOtro = esCategoriaOtro(campo('categoria').value);
    campo('categoria-otra-grupo').hidden = !eligioOtro;
    campo('categoria-otra').disabled = !eligioOtro;
    campo('categoria-otra').required = eligioOtro;
    if (!eligioOtro) {
      campo('categoria-otra').value = '';
    }
  };

  const formularioPerdida = iniciarFormularioPublicacion({
    prefijo: 'perdida',
    enviar: enviarPerdida,
    guardar,
    ahora,
    mensajes: MENSAJES_PERDIDA,
    leerDatosAdicionales: () => ({ categoriaOtra: campo('categoria-otra').value }),
    alReiniciarFormulario: actualizarCategoriaOtra,
    alVolver
  });

  if (!formularioPerdida) {
    return;
  }

  campo('categoria').addEventListener('change', actualizarCategoriaOtra);
  actualizarCategoriaOtra();
  iniciarNavegacionEntreFormularios(formularioPerdida);
}

export function iniciarPostPresenter({
  guardar = guardarHallazgo,
  ahora = () => new Date(),
  alVolver = () => {}
} = {}) {
  iniciarFormularioPerdida(guardarPerdida, ahora, alVolver);
  iniciarFormularioHallazgo(guardar, ahora, alVolver);
}
