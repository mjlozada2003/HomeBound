import { crearHallazgo, crearEnlaceMapa, fechaLocal } from '../models/Posts/hallazgo';
import { obtenerSesionActiva, puedeAccederAPublicar } from '../models/Auth/sesion';
import { guardarHallazgo } from '../services/hallazgoService';

export async function enviarHallazgo(datos, guardar = guardarHallazgo, hoy = new Date()) {
  const resultado = crearHallazgo(datos, hoy);
  if (!resultado.esValido) { return resultado; }
  try {
    const publicacion = await guardar(resultado.publicacion);
    return { esValido: true, mensaje: 'Hallazgo enviado. Pendiente de revisión.', publicacion };
  } catch {
    return { esValido: false,
      mensaje: 'No se pudo enviar el hallazgo. Conservamos tus datos para que lo intentes de nuevo.' };
  }
}

export function iniciarPostPresenter({ guardar = guardarHallazgo, ahora = () => new Date() } = {}) {
  const form = document.querySelector('#hallazgo-form');
  if (!form) { return; }
  const campo = (nombre) => document.querySelector('#hallazgo-' + nombre);
  const boton = campo('enviar');
  const mensaje = campo('mensaje');
  let enviando = false;

  function actualizarFecha() {
    campo('fecha').max = fechaLocal(ahora());
  }
  function mostrarMensaje(texto, tipo = '') {
    mensaje.className = 'mensaje ' + tipo;
    mensaje.textContent = texto;
  }
  function limpiar() {
    form.reset();
    mostrarMensaje('');
    campo('resumen').hidden = true;
    campo('resumen-titulo').textContent = '';
    campo('resumen-detalles').textContent = '';
    campo('resumen-fotos').replaceChildren();
    campo('maps').href = 'https://www.google.com/maps';
    actualizarFecha();
  }

  actualizarFecha();
  form.addEventListener('hallazgo:abrir', () => {
    actualizarFecha();
    campo('categoria').focus();
  });
  form.addEventListener('hallazgo:limpiar', limpiar);
  campo('ubicacion').addEventListener('input', () => {
    campo('maps').href = crearEnlaceMapa(campo('ubicacion').value) || 'https://www.google.com/maps';
  });

  function mostrarEnlace(elemento, enlace) {
    elemento.hidden = !enlace;
    if (enlace) { elemento.href = enlace; } else { elemento.removeAttribute('href'); }
  }
  function mostrarResumen(publicacion) {
    campo('resumen-titulo').textContent = publicacion.titulo;
    campo('resumen-detalles').textContent = publicacion.descripcion;
    campo('resumen-fotos').replaceChildren();
    for (const url of publicacion.fotos) {
      const imagen = document.createElement('img');
      imagen.src = url;
      imagen.alt = publicacion.titulo;
      campo('resumen-fotos').append(imagen);
    }
    mostrarEnlace(campo('contacto-whatsapp'), publicacion.contacto.enlaceWhatsapp);
    mostrarEnlace(campo('contacto-correo'), publicacion.contacto.enlaceCorreo);
    mostrarEnlace(campo('resumen-maps'), publicacion.ubicacion.enlace);
    campo('contacto-whatsapp').textContent = 'WhatsApp: +' + publicacion.contacto.whatsapp;
    campo('contacto-correo').textContent = publicacion.contacto.correo;
    campo('resumen').hidden = false;
  }

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (enviando) { return; }
    const sesion = obtenerSesionActiva();
    if (!puedeAccederAPublicar(sesion)) {
      mostrarMensaje('Debes iniciar sesión para publicar un hallazgo.', 'error');
      return;
    }
    const datos = {
      categoria: campo('categoria').value, titulo: campo('nombre').value,
      descripcion: campo('descripcion').value, fecha: campo('fecha').value,
      fotos: Array.from(campo('fotos').files), ubicacion: campo('ubicacion').value,
      whatsapp: campo('whatsapp').value, correo: campo('correo').value
    };
    enviando = true;
    boton.disabled = true;
    mostrarMensaje('Enviando hallazgo…');
    campo('resumen').hidden = true;
    try {
      const resultado = await enviarHallazgo(datos, guardar, ahora());
      if (obtenerSesionActiva()?.correo !== sesion.correo) { return; }
      mostrarMensaje(resultado.mensaje, resultado.esValido ? 'exito' : 'error');
      if (resultado.esValido) {
        mostrarResumen(resultado.publicacion);
        form.reset();
        campo('maps').href = 'https://www.google.com/maps';
      }
    } finally {
      enviando = false;
      boton.disabled = false;
      actualizarFecha();
    }
  });
}
