import {
  obtenerBandejaPendientes,
  cambiarEstadoPublicacion,
} from '../models/Posts/moderacion.js';
import { ESTADOS } from '../models/Posts/estados.js';
import {
  obtenerPublicacionesPorEstado,
  actualizarEstadoPublicacion,
} from '../services/publicacionesService';
import { escaparHtml } from '../models/html';
import { obtenerSesionActiva } from '../models/Auth/sesion';
import { crearTarjetaHtml } from './plantillaTarjeta';

let pendientesCargadas = [];

async function moderar(coleccion, id, estado) {
  let actualizadas;

  try {
    actualizadas = cambiarEstadoPublicacion(pendientesCargadas, id, obtenerSesionActiva(), estado);
  } catch {
    alert('Acceso denegado: Solo administradores.');
    return;
  }

  const moderada = actualizadas.find((pub) => pub.id === id);

  try {
    await actualizarEstadoPublicacion(coleccion, id, moderada.estado);
  } catch (error) {
    console.error('Error al moderar:', error.message);
    alert('No se pudo actualizar la publicación. Intenta de nuevo.');
    return;
  }

  await renderizarBandejaModeracion();
}

export async function renderizarBandejaModeracion() {
  const contenedorPendientes = document.querySelector('#lista-pendientes');
  if (!contenedorPendientes) {return;}

  let pendientesFirestore;

  try {
    pendientesFirestore = await obtenerPublicacionesPorEstado(ESTADOS.PENDIENTE);
  } catch (error) {
    console.error('Error al cargar pendientes:', error.message);
    contenedorPendientes.innerHTML = '<p class="mensaje-vacio">No se pudieron cargar las publicaciones pendientes.</p>';
    return;
  }

  pendientesCargadas = pendientesFirestore;
  const bandeja = obtenerBandejaPendientes(pendientesFirestore);

  if (bandeja.mensajeVacio) {
    contenedorPendientes.innerHTML = `<p id="mensaje-sin-pendientes" class="mensaje-vacio">${bandeja.mensajeVacio}</p>`;
    return;
  }

  contenedorPendientes.innerHTML = bandeja.pendientes
    .map((pub) =>
      crearTarjetaHtml(
        pub,
        `
        <p class="tarjeta-descripcion">${escaparHtml(pub.descripcion)}</p>
        <p class="tarjeta-fecha"><strong>Fecha:</strong> ${escaparHtml(pub.fecha)} | <strong>Tipo:</strong> ${pub.tipoTexto}</p>
        <div class="acciones-moderacion">
          <button class="btn-aprobar" data-id="${escaparHtml(pub.id)}" data-coleccion="${escaparHtml(pub.coleccion)}">Aprobar</button>
          <button class="btn-rechazar" data-id="${escaparHtml(pub.id)}" data-coleccion="${escaparHtml(pub.coleccion)}">Rechazar</button>
        </div>
      `,
        'tarjeta-moderacion'
      )
    )
    .join('');
}

function manejarClicModeracion(evento) {
  const boton = evento.target;

  if (boton.classList.contains('btn-aprobar')) {
    moderar(boton.dataset.coleccion, boton.dataset.id, ESTADOS.APROBADA);
  } else if (boton.classList.contains('btn-rechazar')) {
    moderar(boton.dataset.coleccion, boton.dataset.id, ESTADOS.RECHAZADA);
  }
}

export function inicializarModeracionPresenter() {
  const contenedorPendientes = document.querySelector('#lista-pendientes');

  if (contenedorPendientes) {
    contenedorPendientes.addEventListener('click', manejarClicModeracion);
  }
}
