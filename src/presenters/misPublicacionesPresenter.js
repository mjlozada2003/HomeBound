import { obtenerMisPublicaciones } from '../models/Posts/misPublicaciones.js';
import { obtenerSesionActiva } from '../models/Auth/sesion';
import { normalizarCorreo } from '../models/Auth/validadorCorreo';
import { obtenerPublicacionesPorAutor } from '../services/publicacionesService';
import { escaparHtml } from '../models/html';
import { crearTarjetaHtml } from './plantillaTarjeta';

let misPublicacionesCargadas = [];

export async function renderizarMisPublicaciones() {
  const contenedor = document.querySelector('#lista-mis-publicaciones');
  if (!contenedor) {return;}

  const usuario = obtenerSesionActiva();

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
        `
        <p class="tarjeta-descripcion">${escaparHtml(pub.descripcion)}</p>
        <p class="tarjeta-fecha"><strong>Fecha:</strong> ${escaparHtml(pub.fecha)} | <strong>Tipo:</strong> ${pub.tipoTexto}</p>
        <p class="tarjeta-etiquetas"><span class="badge-estado">${pub.estadoTexto}</span></p>
      `,
        'tarjeta-mia'
      )
    )
    .join('');
}
