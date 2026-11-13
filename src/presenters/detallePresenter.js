import { escaparHtml } from '../models/html';
import { formatearDetallePublicacion } from '../models/Posts/publicaciones';

export function crearDetalleHtml(detalle) {
  const tieneWhatsapp = Boolean(detalle.enlaceWhatsapp);
  const tieneCorreo = Boolean(detalle.enlaceCorreo);
  const tieneContacto = tieneWhatsapp || tieneCorreo;

  const fotoHtml = detalle.fotoPrincipal
    ? `<div class="detalle-foto-contenedor">
         <img src="${escaparHtml(detalle.fotoPrincipal)}" alt="${escaparHtml(detalle.titulo)}" class="detalle-foto" />
       </div>`
    : '';

  const whatsappHtml = tieneWhatsapp
    ? `<a href="${escaparHtml(detalle.enlaceWhatsapp)}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">
         💬 Contactar por WhatsApp (+${escaparHtml(detalle.whatsapp)})
       </a>`
    : '';

  const correoHtml = tieneCorreo
    ? `<a href="${escaparHtml(detalle.enlaceCorreo)}" class="btn-correo">
         ✉️ Enviar correo (${escaparHtml(detalle.correo)})
       </a>`
    : '';

  const contactoHtml = tieneContacto
    ? `<div class="detalle-contactos-acciones">
         ${whatsappHtml}
         ${correoHtml}
       </div>`
    : '<p class="ayuda">No se proporcionó información de contacto.</p>';

  return `
    <div class="detalle-header">
      <button id="btn-volver-lista" class="btn-ingresar">← Volver a la lista</button>
    </div>

    <article class="detalle-card-body">
      <div class="detalle-etiquetas">
        <span class="badge-tipo">${escaparHtml(detalle.tipoTexto)}</span>
        <span class="badge-estado">${escaparHtml(detalle.estadoTexto)}</span>
      </div>

      <h1 class="card-title">${escaparHtml(detalle.titulo)}</h1>
      <p class="card-subtitle"><strong>${escaparHtml(detalle.categoria)}</strong> &bull; <span>${escaparHtml(detalle.fecha)}</span></p>

      ${fotoHtml}

      <div class="detalle-seccion-texto">
        <h3>Descripción</h3>
        <p class="detalle-descripcion">${escaparHtml(detalle.descripcion)}</p>
      </div>

      <div class="detalle-seccion-contacto">
        <h3>Contacto</h3>
        ${contactoHtml}
      </div>
    </article>
  `;
}

export function renderizarDetalleEnContenedor(publicacion, contenedor, onVolver) {
  if (!contenedor || !publicacion) {
    return;
  }

  const detalle = formatearDetallePublicacion(publicacion);
  contenedor.innerHTML = crearDetalleHtml(detalle);

  const btnVolver = contenedor.querySelector('#btn-volver-lista');
  if (btnVolver && typeof onVolver === 'function') {
    btnVolver.addEventListener('click', onVolver);
  }
}
