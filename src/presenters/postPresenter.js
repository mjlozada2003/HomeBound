import { crearHallazgo } from '../models/Posts/hallazgo';
import { crearPerdida, esCategoriaOtro } from '../models/Posts/perdida';
import { crearEnlaceMapa, obtenerFechaLocal } from '../models/Posts/reglasPublicacion';
import { asignarAutor } from '../models/Posts/misPublicaciones';
import { guardarHallazgo } from '../services/hallazgoService';
import { guardarPerdida } from '../services/perdidaService';

import {
  obtenerSesionActiva,
  puedeAccederAPublicar
} from '../models/Auth/sesion';

const ENLACE_GOOGLE_MAPS = 'https://www.google.com/maps';

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

// Comportamiento compartido por los formularios de hallazgo y pérdida.
function iniciarFormularioPublicacion({
  prefijo,
  enviar,
  guardar,
  ahora,
  mensajes,
  leerDatosAdicionales = () => ({}),
  alReiniciarFormulario = () => {}
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

  campo('ubicacion').addEventListener('input', () => {
    campo('maps').href = crearEnlaceMapa(campo('ubicacion').value) || ENLACE_GOOGLE_MAPS;
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

    const datos = { ...leerDatosComunes(campo), ...leerDatosAdicionales(campo) };

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
        mostrarResumen(campo, resultado.publicacion);
        formulario.reset();
        alReiniciarFormulario();
        campo('maps').href = ENLACE_GOOGLE_MAPS;
      }
    } finally {
      estaEnviando = false;
      botonEnviar.disabled = false;
      actualizarFechaMaxima();
    }
  });

  return { campo, actualizarFechaMaxima };
}

function iniciarFormularioHallazgo(guardar, ahora) {
  iniciarFormularioPublicacion({
    prefijo: 'hallazgo',
    enviar: enviarHallazgo,
    guardar,
    ahora,
    mensajes: MENSAJES_HALLAZGO
  });
}

function iniciarNavegacionEntreFormularios(formularioPerdida) {
  const { campo, actualizarFechaMaxima } = formularioPerdida;

  document.querySelector('#hallazgo-ir-perdida').addEventListener('click', () => {
    if (!puedeAccederAPublicar(obtenerSesionActiva())) {
      document.querySelector('#nav-btn-ingresar').click();
      return;
    }
    document.querySelector('#hallazgo-seccion').classList.add('oculto');
    campo('seccion').classList.remove('oculto');
    actualizarFechaMaxima();
    campo('categoria').focus();
  });

  document.querySelector('#perdida-ir-hallazgo').addEventListener('click', () => {
    document.querySelector('#nav-btn-publicar').click();
  });
}

function iniciarFormularioPerdida(guardar, ahora) {
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
    alReiniciarFormulario: actualizarCategoriaOtra
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
  ahora = () => new Date()
} = {}) {
  iniciarFormularioPerdida(guardarPerdida, ahora);
  iniciarFormularioHallazgo(guardar, ahora);
}
