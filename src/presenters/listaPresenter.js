import {
  obtenerPublicacionesPaginadas,
  obtenerTodasLasPublicaciones,
  establecerPublicaciones,
} from '../models/Posts/publicaciones.js';
import { obtenerPublicacionesPorEstado } from '../services/publicacionesService';
import { escaparHtml } from '../models/html';

let paginaActual = 1;
const POR_PAGINA = 10;

export async function renderizarListaPublicaciones() {
  const contenedorLista = document.querySelector('#lista-publicaciones');
  if (!contenedorLista) {return;}

  try {
    establecerPublicaciones(await obtenerPublicacionesPorEstado('APROBADA'));
  } catch (error) {
    console.error('Error al cargar publicaciones:', error.message);
    contenedorLista.innerHTML = '<p class="mensaje-vacio">No se pudieron cargar las publicaciones. Intenta de nuevo.</p>';
    return;
  }

  dibujarListaPublicaciones();
}

function dibujarListaPublicaciones() {
  const contenedorLista = document.querySelector('#lista-publicaciones');
  const contenedorPaginacion = document.querySelector('#controles-paginacion');

  if (!contenedorLista) {return;}

  const todas = obtenerTodasLasPublicaciones();
  const resultado = obtenerPublicacionesPaginadas(todas, paginaActual, POR_PAGINA);

  paginaActual = resultado.paginaActual;

  if (resultado.mensajeVacio) {
    contenedorLista.innerHTML = `<p id="mensaje-vacio" class="mensaje-vacio">${resultado.mensajeVacio}</p>`;
    if (contenedorPaginacion) {contenedorPaginacion.innerHTML = '';}
    return;
  }

  contenedorLista.innerHTML = resultado.publicaciones
    .map(
      (pub) => `
      <div class="tarjeta-publicacion" data-id="${escaparHtml(pub.id)}">
        <img src="${escaparHtml(pub.foto)}" alt="${escaparHtml(pub.titulo)}" class="tarjeta-foto" />
        <div class="tarjeta-info">
          <h3 class="tarjeta-titulo">${escaparHtml(pub.titulo)}</h3>
          <p class="tarjeta-fecha"><strong>Fecha:</strong> ${escaparHtml(pub.fecha)}</p>
          <p class="tarjeta-etiquetas">
            <span class="badge-tipo">${pub.tipoTexto}</span> |
            <span class="badge-estado">${pub.estadoTexto}</span>
          </p>
        </div>
      </div>
    `
    )
    .join('');

  if (contenedorPaginacion) {
    contenedorPaginacion.innerHTML = `
      <button id="btn-anterior" ${paginaActual <= 1 ? 'disabled' : ''}>Anterior</button>
      <span id="info-pagina">Página ${paginaActual} de ${resultado.totalPaginas}</span>
      <button id="btn-siguiente" ${paginaActual >= resultado.totalPaginas ? 'disabled' : ''}>Siguiente</button>
    `;

    const btnAnterior = document.querySelector('#btn-anterior');
    const btnSiguiente = document.querySelector('#btn-siguiente');

    if (btnAnterior) {
      btnAnterior.addEventListener('click', () => {
        if (paginaActual > 1) {
          paginaActual--;
          dibujarListaPublicaciones();
        }
      });
    }

    if (btnSiguiente) {
      btnSiguiente.addEventListener('click', () => {
        if (paginaActual < resultado.totalPaginas) {
          paginaActual++;
          dibujarListaPublicaciones();
        }
      });
    }
  }
}

export function inicializarListaPresenter() {
  renderizarListaPublicaciones();
}
