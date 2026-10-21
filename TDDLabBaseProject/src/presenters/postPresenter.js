import {
  obtenerPublicacionesPaginadas,
  obtenerTodasLasPublicaciones,
} from "../models/Posts/publicaciones.js";
import {
  obtenerBandejaPendientes,
  moderarPublicacionEnMemoria,
} from "../models/Posts/moderacion.js";
import { obtenerSesionActiva } from "../models/Auth/sesion.js";

let paginaActual = 1;
const POR_PAGINA = 10;

export function renderizarListaPublicaciones() {
  const contenedorLista = document.querySelector("#lista-publicaciones");
  const contenedorPaginacion = document.querySelector("#controles-paginacion");

  if (!contenedorLista) return;

  const todas = obtenerTodasLasPublicaciones();
  const resultado = obtenerPublicacionesPaginadas(todas, paginaActual, POR_PAGINA);

  paginaActual = resultado.paginaActual;

  if (resultado.mensajeVacio) {
    contenedorLista.innerHTML = `<p id="mensaje-vacio" class="mensaje-vacio">${resultado.mensajeVacio}</p>`;
    if (contenedorPaginacion) contenedorPaginacion.innerHTML = "";
    return;
  }

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

export function renderizarBandejaModeracion() {
  const contenedorPendientes = document.querySelector("#lista-pendientes");
  if (!contenedorPendientes) return;

  const todas = obtenerTodasLasPublicaciones();
  const bandeja = obtenerBandejaPendientes(todas);

  if (bandeja.mensajeVacio) {
    contenedorPendientes.innerHTML = `<p id="mensaje-sin-pendientes" class="mensaje-vacio">${bandeja.mensajeVacio}</p>`;
    return;
  }

  contenedorPendientes.innerHTML = bandeja.pendientes
    .map(
      (pub) => `
      <div class="tarjeta-publicacion tarjeta-moderacion" data-id="${pub.id}">
        <img src="${pub.foto}" alt="${pub.titulo}" class="tarjeta-foto" />
        <div class="tarjeta-info">
          <h3 class="tarjeta-titulo">${pub.titulo}</h3>
          <p class="tarjeta-descripcion">${pub.descripcion}</p>
          <p class="tarjeta-fecha"><strong>Fecha:</strong> ${pub.fecha} | <strong>Tipo:</strong> ${pub.tipoTexto}</p>
          <div class="acciones-moderacion">
            <button class="btn-aprobar" data-id="${pub.id}">Aprobar</button>
            <button class="btn-rechazar" data-id="${pub.id}">Rechazar</button>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  contenedorPendientes.querySelectorAll(".btn-aprobar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const usuario = obtenerSesionActiva();
      moderarPublicacionEnMemoria(id, "APROBAR", usuario);
      renderizarBandejaModeracion();
    });
  });

  contenedorPendientes.querySelectorAll(".btn-rechazar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const usuario = obtenerSesionActiva();
      moderarPublicacionEnMemoria(id, "RECHAZAR", usuario);
      renderizarBandejaModeracion();
    });
  });
}

export function inicializarPostPresenter() {
  renderizarListaPublicaciones();
}