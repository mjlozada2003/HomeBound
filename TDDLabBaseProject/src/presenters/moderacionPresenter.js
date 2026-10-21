import {
  obtenerBandejaPendientes,
  verificarPermisoModeracion,
} from "../models/Posts/moderacion.js";
import {
  obtenerPublicacionesPorEstado,
  actualizarEstadoPublicacion,
} from "../services/publicacionesService";
import { escaparHtml } from "../models/html";
import { obtenerSesionActiva } from "../models/Auth/sesion";

async function moderar(coleccion, id, estado) {
  if (!verificarPermisoModeracion(obtenerSesionActiva())) {
    alert("Acceso denegado: Solo administradores.");
    return;
  }

  try {
    await actualizarEstadoPublicacion(coleccion, id, estado);
  } catch (error) {
    console.error("Error al moderar:", error.message);
    alert("No se pudo actualizar la publicación. Intenta de nuevo.");
    return;
  }

  await renderizarBandejaModeracion();
}

export async function renderizarBandejaModeracion() {
  const contenedorPendientes = document.querySelector("#lista-pendientes");
  if (!contenedorPendientes) return;

  let pendientesFirestore;

  try {
    pendientesFirestore = await obtenerPublicacionesPorEstado("Pendiente de revisión");
  } catch (error) {
    console.error("Error al cargar pendientes:", error.message);
    contenedorPendientes.innerHTML = `<p class="mensaje-vacio">No se pudieron cargar las publicaciones pendientes.</p>`;
    return;
  }

  const bandeja = obtenerBandejaPendientes(pendientesFirestore);

  if (bandeja.mensajeVacio) {
    contenedorPendientes.innerHTML = `<p id="mensaje-sin-pendientes" class="mensaje-vacio">${bandeja.mensajeVacio}</p>`;
    return;
  }

  contenedorPendientes.innerHTML = bandeja.pendientes
    .map(
      (pub) => `
      <div class="tarjeta-publicacion tarjeta-moderacion" data-id="${escaparHtml(pub.id)}">
        <img src="${escaparHtml(pub.foto)}" alt="${escaparHtml(pub.titulo)}" class="tarjeta-foto" />
        <div class="tarjeta-info">
          <h3 class="tarjeta-titulo">${escaparHtml(pub.titulo)}</h3>
          <p class="tarjeta-descripcion">${escaparHtml(pub.descripcion)}</p>
          <p class="tarjeta-fecha"><strong>Fecha:</strong> ${escaparHtml(pub.fecha)} | <strong>Tipo:</strong> ${pub.tipoTexto}</p>
          <div class="acciones-moderacion">
            <button class="btn-aprobar" data-id="${escaparHtml(pub.id)}" data-coleccion="${escaparHtml(pub.coleccion)}">Aprobar</button>
            <button class="btn-rechazar" data-id="${escaparHtml(pub.id)}" data-coleccion="${escaparHtml(pub.coleccion)}">Rechazar</button>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  contenedorPendientes.querySelectorAll(".btn-aprobar").forEach((btn) => {
    btn.addEventListener("click", () => {
      moderar(btn.dataset.coleccion, btn.dataset.id, "APROBADA");
    });
  });

  contenedorPendientes.querySelectorAll(".btn-rechazar").forEach((btn) => {
    btn.addEventListener("click", () => {
      moderar(btn.dataset.coleccion, btn.dataset.id, "RECHAZADA");
    });
  });
}
