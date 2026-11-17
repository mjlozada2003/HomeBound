import { escaparHtml } from '../models/html';
import { formatearDetallePublicacion } from '../models/Posts/publicaciones';
import { generarEnlacePublicacion } from '../models/Posts/enlacePublicacion';
import {
  ArrowLeft,
  Calendar,
  CircleCheck,
  ImageOff,
  Info,
  MapPin,
  Package,
  PawPrint,
  Phone,
  Share2,
  Tag,
} from 'lucide';
import { iconoSvg } from './iconos';

let temporizadorMensaje = null;

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
    return iconoSvg(PawPrint);
  }
  if (cat.includes('OBJETO')) {
    return iconoSvg(Package);
  }
  return iconoSvg(Tag);
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
    : `<div class="detalle-sin-foto">${iconoSvg(ImageOff)}<span>Sin imagen disponible</span></div>`;

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
           ${iconoSvg(Phone, 'detalle-icono-svg')}
         </span>
         <span class="detalle-dato-texto">${contactoHtml}</span>
       </div>`
    : `<div class="detalle-dato-fila ayuda">
         <span class="detalle-dato-icono" aria-hidden="true">${iconoSvg(Info, 'detalle-icono-svg')}</span>
         <span class="detalle-dato-texto">No se proporcionó información de contacto.</span>
       </div>`;

  const ubicacionTexto = detalle.ubicacion || '';
  const filaUbicacion = ubicacionTexto
    ? `<div class="detalle-dato-fila">
         <span class="detalle-dato-icono" aria-hidden="true">
           ${iconoSvg(MapPin, 'detalle-icono-svg')}
         </span>
         <span class="detalle-dato-texto">
           ${detalle.enlaceMapa
             ? `<a href="${escaparHtml(detalle.enlaceMapa)}" target="_blank" rel="noopener noreferrer">${escaparHtml(ubicacionTexto)}</a>`
             : escaparHtml(ubicacionTexto)}
         </span>
       </div>`
    : '';

  // HU-14: el mapa con el marcador solo se muestra si se indicó una ubicación ubicable.
  const mapaHtml = detalle.mapaEmbebido
    ? `<div class="detalle-mapa">
         <iframe
           id="detalle-mapa"
           class="detalle-mapa-iframe"
           src="${escaparHtml(detalle.mapaEmbebido)}"
           title="Mapa de la ubicación: ${escaparHtml(ubicacionTexto)}"
           loading="lazy"
           referrerpolicy="no-referrer-when-downgrade"
         ></iframe>
       </div>`
    : '';

  return `
    <div class="detalle-vista">
      <button id="btn-volver-lista" class="btn-volver-detalle" type="button">${iconoSvg(ArrowLeft)}Volver a la lista</button>

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
                ${iconoSvg(Calendar, 'detalle-icono-svg')}
              </span>
              <span class="detalle-dato-texto">${verboFecha} <strong>${escaparHtml(fechaTexto)}</strong></span>
            </div>

            ${filaUbicacion}

            ${filaContacto}
          </div>

          ${mapaHtml}

          <button id="btn-compartir" class="btn-compartir" type="button">
            ${iconoSvg(Share2, 'icono-compartir')}
            Compartir
          </button>

          <div id="mensaje-enlace-copiado" class="toast-enlace-copiado oculto" role="status" aria-live="polite">
            <span class="icono-check-circulo" aria-hidden="true">
              ${iconoSvg(CircleCheck)}
            </span>
            <span class="texto-enlace-copiado">Enlace copiado. ¡Compártelo en tus redes!</span>
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

  const btnCompartir = contenedor.querySelector('#btn-compartir');
  const mensajeCopiado = contenedor.querySelector('#mensaje-enlace-copiado');

  if (btnCompartir) {
    btnCompartir.addEventListener('click', async () => {
      const enlace = generarEnlacePublicacion(publicacion.id);
      try {
        if (typeof window !== 'undefined' && window.navigator?.clipboard) {
          await window.navigator.clipboard.writeText(enlace);
        }
      } catch {
        // Fallback silencioso si el portapapeles no tiene permisos
      }

      if (mensajeCopiado) {
        mensajeCopiado.classList.remove('oculto');
        if (temporizadorMensaje) {
          clearTimeout(temporizadorMensaje);
        }
        temporizadorMensaje = setTimeout(() => {
          mensajeCopiado.classList.add('oculto');
        }, 3000);
      }
    });
  }
}
