import { obtenerPublicacionesPaginadas } from '../models/Posts/publicaciones.js';
import { ESTADOS } from '../models/Posts/estados.js';
import { obtenerPublicacionesPorEstado } from '../services/publicacionesService';
import { escaparHtml } from '../models/html';
import { crearTarjetaHtml } from './plantillaTarjeta';

let publicacionesCargadas = [];
let paginaActual = 1;
const POR_PAGINA = 10;

export async function renderizarListaPublicaciones() {
  const contenedorLista = document.querySelector('#lista-publicaciones');
  if (!contenedorLista) {return;}

  try {
    publicacionesCargadas = await obtenerPublicacionesPorEstado(ESTADOS.APROBADA);
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

  const resultado = obtenerPublicacionesPaginadas(publicacionesCargadas, paginaActual, POR_PAGINA);

  paginaActual = resultado.paginaActual;

  if (resultado.mensajeVacio) {
    contenedorLista.innerHTML = `<p id="mensaje-vacio" class="mensaje-vacio">${resultado.mensajeVacio}</p>`;
    if (contenedorPaginacion) {contenedorPaginacion.innerHTML = '';}
    return;
  }

  contenedorLista.innerHTML = resultado.publicaciones
    .map((pub) =>
      crearTarjetaHtml(
        pub,
        `
        <p class="tarjeta-fecha"><strong>Fecha:</strong> ${escaparHtml(pub.fecha)}</p>
        <p class="tarjeta-etiquetas">
          <span class="badge-tipo">${pub.tipoTexto}</span> |
          <span class="badge-estado">${pub.estadoTexto}</span>
        </p>
      `
      )
    )
    .join('');

  if (contenedorPaginacion) {
    contenedorPaginacion.innerHTML = `
      <button id="btn-anterior" ${paginaActual <= 1 ? 'disabled' : ''}>Anterior</button>
      <span id="info-pagina">Página ${paginaActual} de ${resultado.totalPaginas}</span>
      <button id="btn-siguiente" ${paginaActual >= resultado.totalPaginas ? 'disabled' : ''}>Siguiente</button>
    `;
  }
}

function cambiarPagina(evento) {
  if (evento.target.id === 'btn-anterior') {
    paginaActual--;
  } else if (evento.target.id === 'btn-siguiente') {
    paginaActual++;
  } else {
    return;
  }

  dibujarListaPublicaciones();
}

export function inicializarListaPresenter() {
  const contenedorPaginacion = document.querySelector('#controles-paginacion');

  if (contenedorPaginacion) {
    contenedorPaginacion.addEventListener('click', cambiarPagina);
  }

  renderizarListaPublicaciones();
}
