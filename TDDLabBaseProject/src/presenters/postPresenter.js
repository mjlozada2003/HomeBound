import {
  obtenerPublicacionesPaginadas,
  obtenerTodasLasPublicaciones,
} from "../models/Posts/publicaciones.js";

let paginaActual = 1;
const POR_PAGINA = 10;

export function renderizarListaPublicaciones() {
  const contenedorLista = document.querySelector("#lista-publicaciones");
  const contenedorPaginacion = document.querySelector("#controles-paginacion");

  if (!contenedorLista) return;

  const todas = obtenerTodasLasPublicaciones();
  const resultado = obtenerPublicacionesPaginadas(todas, paginaActual, POR_PAGINA);

  paginaActual = resultado.paginaActual;

  // Estado vacío
  if (resultado.mensajeVacio) {
    contenedorLista.innerHTML = `<p id="mensaje-vacio" class="mensaje-vacio">${resultado.mensajeVacio}</p>`;
    if (contenedorPaginacion) contenedorPaginacion.innerHTML = "";
    return;
  }

  // Renderizar tarjetas básicas
  contenedorLista.innerHTML = resultado.publicaciones
    .map(
      (pub) => `
      <div class="tarjeta-publicacion" data-id="${pub.id}">
        <img src="${pub.foto}" alt="${pub.titulo}" class="tarjeta-foto" />
        <div class="tarjeta-info">
          <h3 class="tarjeta-titulo">${pub.titulo}</h3>
          <p class="tarjeta-fecha"><strong>Fecha:</strong> ${pub.fecha}</p>
          <p class="tarjeta-etiquetas">
            <span class="badge-tipo">${pub.tipoTexto}</span> | 
            <span class="badge-estado">${pub.estadoTexto}</span>
          </p>
        </div>
      </div>
    `
    )
    .join("");

  // Renderizar controles de paginación simples
  if (contenedorPaginacion) {
    contenedorPaginacion.innerHTML = `
      <button id="btn-anterior" ${paginaActual <= 1 ? "disabled" : ""}>Anterior</button>
      <span id="info-pagina">Página ${paginaActual} de ${resultado.totalPaginas}</span>
      <button id="btn-siguiente" ${paginaActual >= resultado.totalPaginas ? "disabled" : ""}>Siguiente</button>
    `;

    const btnAnterior = document.querySelector("#btn-anterior");
    const btnSiguiente = document.querySelector("#btn-siguiente");

    if (btnAnterior) {
      btnAnterior.addEventListener("click", () => {
        if (paginaActual > 1) {
          paginaActual--;
          renderizarListaPublicaciones();
        }
      });
    }

    if (btnSiguiente) {
      btnSiguiente.addEventListener("click", () => {
        if (paginaActual < resultado.totalPaginas) {
          paginaActual++;
          renderizarListaPublicaciones();
        }
      });
    }
  }
}

export function inicializarPostPresenter() {
  renderizarListaPublicaciones();
}