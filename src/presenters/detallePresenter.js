import { escaparHtml } from '../models/html';
import { formatearDetallePublicacion } from '../models/Posts/publicaciones';

const MESES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

function formatearFechaAmigable(fechaIso) {
  if (!fechaIso || typeof fechaIso !== 'string') {
    return '';
  }
  const partes = fechaIso.split('-');
  if (partes.length === 3) {
    const anio = partes[0];
    const mesIndex = parseInt(partes[1], 10) - 1;
    const dia = parseInt(partes[2], 10);
    if (mesIndex >= 0 && mesIndex < 12 && !Number.isNaN(dia)) {
      return `${dia} ${MESES[mesIndex]} ${anio}`;
    }
  }
  return fechaIso;
}

function capitalizar(texto) {
  if (!texto) {
    return '';
  }
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

function formatearCategoriaTexto(categoria, categoriaOtra) {
  const catMayus = (categoria || '').toUpperCase();
  let nombreBase = categoria || '';
  if (catMayus === 'MASCOTA') {
    nombreBase = 'Mascota';
  } else if (catMayus === 'OBJETO') {
    nombreBase = 'Objeto';
  } else if (catMayus === 'OTRO') {
    nombreBase = 'Otro';
  } else {
    nombreBase = capitalizar(categoria || '');
  }

  if (categoriaOtra && typeof categoriaOtra === 'string' && categoriaOtra.trim()) {
    if (nombreBase === 'Otro') {
      return categoriaOtra.trim();
    }
    return `${nombreBase} · ${categoriaOtra.trim()}`;
  }
  return nombreBase;
}

function obtenerIconoCategoria(categoria) {
  const cat = categoria?.toUpperCase() || '';
  if (cat.includes('MASCOTA')) {
    return '🐾';
  }
  if (cat.includes('OBJETO')) {
    return '📦';
  }
  return '🏷️';
}

export function crearDetalleHtml(detalle) {
  const esPerdida = detalle.tipoTexto === 'Perdido';
  const tipoMayus = (detalle.tipoTexto || '').toUpperCase();
  const claseTipo = esPerdida ? 'badge-tipo-perdido' : 'badge-tipo-hallazgo';
  const verboFecha = esPerdida ? 'Se perdió el' : 'Se encontró el';
  const fechaTexto = formatearFechaAmigable(detalle.fecha);
  const iconoCat = obtenerIconoCategoria(detalle.categoria);
  const textoCategoria = detalle.categoriaTexto
    || formatearCategoriaTexto(detalle.categoria, detalle.categoriaOtra);

  const fotoHtml = detalle.fotoPrincipal
    ? `<img src="${escaparHtml(detalle.fotoPrincipal)}" alt="${escaparHtml(detalle.titulo)}" class="detalle-foto" />`
    : '<div class="detalle-sin-foto"><span>📷 Sin imagen disponible</span></div>';

  const tieneWhatsapp = Boolean(detalle.enlaceWhatsapp && detalle.whatsapp);
  const tieneCorreo = Boolean(detalle.enlaceCorreo && detalle.correo);

  let contactoHtml = '';
  if (tieneWhatsapp && tieneCorreo) {
    contactoHtml = `Mi whatsapp es <a href="${escaparHtml(detalle.enlaceWhatsapp)}" target="_blank" rel="noopener noreferrer">${escaparHtml(detalle.whatsapp)}</a> y mi correo es <a href="${escaparHtml(detalle.enlaceCorreo)}">${escaparHtml(detalle.correo)}</a>`;
  } else if (tieneWhatsapp) {
    contactoHtml = `Mi whatsapp es <a href="${escaparHtml(detalle.enlaceWhatsapp)}" target="_blank" rel="noopener noreferrer">${escaparHtml(detalle.whatsapp)}</a>`;
  } else if (tieneCorreo) {
    contactoHtml = `Mi correo es <a href="${escaparHtml(detalle.enlaceCorreo)}">${escaparHtml(detalle.correo)}</a>`;
  }

  const filaContacto = contactoHtml
    ? `<div class="detalle-dato-fila">
         <span class="detalle-dato-icono" aria-hidden="true">
           <svg class="detalle-icono-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
           </svg>
         </span>
         <span class="detalle-dato-texto">${contactoHtml}</span>
       </div>`
    : `<div class="detalle-dato-fila ayuda">
         <span class="detalle-dato-icono" aria-hidden="true">ℹ️</span>
         <span class="detalle-dato-texto">No se proporcionó información de contacto.</span>
       </div>`;

  const ubicacionTexto = detalle.ubicacion || '';
  const filaUbicacion = ubicacionTexto
    ? `<div class="detalle-dato-fila">
         <span class="detalle-dato-icono" aria-hidden="true">
           <svg class="detalle-icono-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
             <circle cx="12" cy="10" r="3"></circle>
           </svg>
         </span>
         <span class="detalle-dato-texto">
           ${detalle.enlaceMapa
             ? `<a href="${escaparHtml(detalle.enlaceMapa)}" target="_blank" rel="noopener noreferrer">${escaparHtml(ubicacionTexto)}</a>`
             : escaparHtml(ubicacionTexto)}
         </span>
       </div>`
    : '';

  return `
    <div class="detalle-vista">
      <button id="btn-volver-lista" class="btn-volver-detalle" type="button">← Volver a la lista</button>

      <div class="detalle-tarjeta-principal">
        <div class="detalle-columna-foto">
          ${fotoHtml}
        </div>

        <div class="detalle-columna-info">
          <div class="detalle-badgerow">
            <span class="badge-tipo ${claseTipo}">${escaparHtml(tipoMayus)}</span>
            <span class="badge-categoria" data-categoria="${escaparHtml(detalle.categoria || '')}">${iconoCat} ${escaparHtml(textoCategoria)}</span>
            <span class="badge-estado sr-only">${escaparHtml(detalle.estadoTexto || '')}</span>
          </div>

          <h1 id="detalle-titulo" class="detalle-titulo">${escaparHtml(detalle.titulo)}</h1>

          <p class="detalle-descripcion">${escaparHtml(detalle.descripcion)}</p>

          <div class="detalle-caja-datos">
            <div class="detalle-dato-fila">
              <span class="detalle-dato-icono" aria-hidden="true">
                <svg class="detalle-icono-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </span>
              <span class="detalle-dato-texto">${verboFecha} <strong>${escaparHtml(fechaTexto)}</strong></span>
            </div>

            ${filaUbicacion}

            ${filaContacto}
          </div>
        </div>
      </div>
    </div>
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
