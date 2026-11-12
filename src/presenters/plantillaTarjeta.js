import { escaparHtml } from '../models/html';

export function crearTarjetaHtml({ id, foto, titulo }, contenido, claseExtra = '') {
  const clases = `tarjeta-publicacion ${claseExtra}`.trim();

  return `
    <div class="${clases}" data-id="${escaparHtml(id)}">
      <img src="${escaparHtml(foto)}" alt="${escaparHtml(titulo)}" class="tarjeta-foto" />
      <div class="tarjeta-info">
        <h3 class="tarjeta-titulo">${escaparHtml(titulo)}</h3>
        ${contenido}
      </div>
    </div>
  `;
}
