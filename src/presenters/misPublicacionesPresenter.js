import {
  obtenerMisPublicaciones,
  editarPublicacion,
  eliminarPublicacion,
} from '../models/Posts/misPublicaciones.js';
import { obtenerSesionActiva } from '../models/Auth/sesion';
import { normalizarCorreo } from '../models/Auth/validadorCorreo';
import {
  obtenerPublicacionesPorAutor,
  actualizarPublicacion,
  borrarPublicacion,
} from '../services/publicacionesService';
import { escaparHtml } from '../models/html';
import { crearTarjetaHtml } from './plantillaTarjeta';

let misPublicacionesCargadas = [];
let idEditando = null;

export async function renderizarMisPublicaciones() {
  const contenedor = document.querySelector('#lista-mis-publicaciones');
  if (!contenedor) {return;}

  const usuario = obtenerSesionActiva();
  idEditando = null;

  try {
    misPublicacionesCargadas = usuario
      ? await obtenerPublicacionesPorAutor(normalizarCorreo(usuario.correo))
      : [];
  } catch (error) {
    console.error('Error al cargar mis publicaciones:', error.message);
    contenedor.innerHTML = '<p class="mensaje-vacio">No se pudieron cargar tus publicaciones. Intenta de nuevo.</p>';
    return;
  }

  dibujarMisPublicaciones();
}

function contenidoTarjeta(pub) {
  return `
    <p class="tarjeta-descripcion">${escaparHtml(pub.descripcion)}</p>
    <p class="tarjeta-fecha"><strong>Fecha:</strong> ${escaparHtml(pub.fecha)} | <strong>Tipo:</strong> ${pub.tipoTexto}</p>
    <p class="tarjeta-etiquetas"><span class="badge-estado">${pub.estadoTexto}</span></p>
    <div class="acciones-mis-publicaciones">
      <button type="button" class="btn-editar" data-id="${escaparHtml(pub.id)}">Editar</button>
      <button type="button" class="btn-eliminar" data-id="${escaparHtml(pub.id)}">Eliminar</button>
    </div>
  `;
}

function formularioEdicion(pub) {
  return `
    <form class="form-editar" data-id="${escaparHtml(pub.id)}">
      <label>Título
        <input name="titulo" type="text" value="${escaparHtml(pub.titulo)}" />
      </label>
      <label>Descripción
        <textarea name="descripcion" rows="3">${escaparHtml(pub.descripcion)}</textarea>
      </label>
      <p class="mensaje-edicion" role="alert"></p>
      <div class="acciones-mis-publicaciones">
        <button type="submit" class="btn-guardar">Guardar</button>
        <button type="button" class="btn-cancelar">Cancelar</button>
      </div>
    </form>
  `;
}

function dibujarMisPublicaciones() {
  const contenedor = document.querySelector('#lista-mis-publicaciones');
  if (!contenedor) {return;}

  const resultado = obtenerMisPublicaciones(misPublicacionesCargadas, obtenerSesionActiva());

  if (resultado.mensajeVacio) {
    contenedor.innerHTML = `<p id="mensaje-sin-mis-publicaciones" class="mensaje-vacio">${resultado.mensajeVacio}</p>`;
    return;
  }

  contenedor.innerHTML = resultado.publicaciones
    .map((pub) =>
      crearTarjetaHtml(
        pub,
        pub.id === idEditando ? formularioEdicion(pub) : contenidoTarjeta(pub),
        'tarjeta-mia'
      )
    )
    .join('');
}

async function guardarEdicion(formulario) {
  const id = formulario.dataset.id;
  const original = misPublicacionesCargadas.find((pub) => pub.id === id);
  const mensaje = formulario.querySelector('.mensaje-edicion');
  let resultado;

  try {
    resultado = editarPublicacion(
      original,
      {
        titulo: formulario.elements.titulo.value,
        descripcion: formulario.elements.descripcion.value,
      },
      obtenerSesionActiva()
    );
  } catch (error) {
    alert(error.message);
    return;
  }

  if (!resultado.esValido) {
    mensaje.textContent = resultado.mensaje;
    return;
  }

  try {
    await actualizarPublicacion(original.coleccion, id, resultado.cambios);
  } catch (error) {
    console.error('Error al editar:', error.message);
    mensaje.textContent = 'No se pudieron guardar los cambios. Intenta de nuevo.';
    return;
  }

  misPublicacionesCargadas = misPublicacionesCargadas.map((pub) =>
    pub.id === id ? { ...pub, ...resultado.cambios } : pub
  );
  idEditando = null;
  dibujarMisPublicaciones();
}

async function eliminar(id) {
  const publicacion = misPublicacionesCargadas.find((pub) => pub.id === id);
  if (!publicacion) {return;}

  const confirmado = window.confirm(
    `¿Seguro que quieres eliminar "${publicacion.titulo}"? Esta acción no se puede deshacer.`
  );
  if (!confirmado) {return;}

  let restantes;

  try {
    restantes = eliminarPublicacion(misPublicacionesCargadas, id, obtenerSesionActiva());
  } catch (error) {
    alert(error.message);
    return;
  }

  try {
    await borrarPublicacion(publicacion.coleccion, id);
  } catch (error) {
    console.error('Error al eliminar:', error.message);
    alert('No se pudo eliminar la publicación. Intenta de nuevo.');
    return;
  }

  misPublicacionesCargadas = restantes;
  dibujarMisPublicaciones();
}

function manejarClicMisPublicaciones(evento) {
  const boton = evento.target;

  if (boton.classList.contains('btn-editar')) {
    idEditando = boton.dataset.id;
    dibujarMisPublicaciones();
  } else if (boton.classList.contains('btn-eliminar')) {
    eliminar(boton.dataset.id);
  } else if (boton.classList.contains('btn-cancelar')) {
    idEditando = null;
    dibujarMisPublicaciones();
  }
}

function manejarEnvioMisPublicaciones(evento) {
  if (!evento.target.classList.contains('form-editar')) {return;}

  evento.preventDefault();
  guardarEdicion(evento.target);
}

export function inicializarMisPublicacionesPresenter() {
  const contenedor = document.querySelector('#lista-mis-publicaciones');

  if (contenedor) {
    contenedor.addEventListener('click', manejarClicMisPublicaciones);
    contenedor.addEventListener('submit', manejarEnvioMisPublicaciones);
  }
}
