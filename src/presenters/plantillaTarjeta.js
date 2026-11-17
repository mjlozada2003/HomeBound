import { escaparHtml } from '../models/html';

export function crearTarjetaHtml({ id, foto, titulo }, contenido, claseExtra = '') {
  const clases = `tarjeta-publicacion ${claseExtra}`.trim();

  return `
    <div class="${clases}" data-id="${escaparHtml(id)}">
      <div class="tarjeta-foto-marco"><img src="${escaparHtml(foto)}" alt="${escaparHtml(titulo)}" class="tarjeta-foto" loading="lazy" /></div>
      <div class="tarjeta-info">
        <h3 class="tarjeta-titulo">${escaparHtml(titulo)}</h3>
        ${contenido}
      </div>
    </div>
  `;
}

// Etiquetas (píldoras) de tipo y estado; el CSS les da el mismo formato en todas las vistas.
export function crearEtiquetasHtml({ tipoTexto, estadoTexto }) {
  const claseTipo = tipoTexto === 'Perdido' ? 'badge-tipo-perdido' : 'badge-tipo-hallazgo';
  const etiquetaEstado = estadoTexto
    ? `<span class="badge-estado">${escaparHtml(estadoTexto)}</span>`
    : '';

  return `<p class="tarjeta-etiquetas"><span class="badge-tipo ${claseTipo}">${escaparHtml(tipoTexto)}</span>${etiquetaEstado}</p>`;
}

// Tarjetas "fantasma" con la forma de una tarjeta real, mientras se cargan las publicaciones.
export function crearEsqueletosHtml(cantidad) {
  const esqueleto = `
    <div class="tarjeta-esqueleto" aria-hidden="true">
      <div class="esqueleto-foto"></div>
      <div class="esqueleto-linea esqueleto-linea-larga"></div>
      <div class="esqueleto-linea esqueleto-linea-corta"></div>
    </div>`;
  return esqueleto.repeat(Math.max(0, cantidad));
}
