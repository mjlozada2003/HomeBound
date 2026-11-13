import { calcularEstadisticas } from '../models/Stats/estadisticas.js';
import { ESTADOS } from '../models/Posts/estados.js';
import { obtenerSesionActiva, puedeAccederAAdmin } from '../models/Auth/sesion';
import { contarPublicacionesPorEstado } from '../services/publicacionesService';

function tarjetaContador(id, titulo, resumen) {
  return `
    <div id="${id}" class="tarjeta-contador">
      <p class="contador-titulo">${titulo}</p>
      <p class="contador-total">${resumen.total}</p>
      <p class="contador-detalle">${resumen.hallazgos} hallazgos · ${resumen.perdidas} pérdidas</p>
    </div>
  `;
}

export async function renderizarEstadisticas() {
  const contenedor = document.querySelector('#panel-estadisticas');
  if (!contenedor) {return;}

  const usuario = obtenerSesionActiva();
  if (!puedeAccederAAdmin(usuario)) {
    contenedor.innerHTML = '';
    return;
  }

  let estadisticas;

  try {
    const [activas, resueltas] = await Promise.all([
      contarPublicacionesPorEstado(ESTADOS.APROBADA),
      contarPublicacionesPorEstado(ESTADOS.RESUELTA),
    ]);
    estadisticas = calcularEstadisticas({ activas, resueltas }, usuario);
  } catch (error) {
    console.error('Error al cargar estadísticas:', error.message);
    contenedor.innerHTML = '<p class="mensaje-vacio">No se pudieron cargar las estadísticas.</p>';
    return;
  }

  contenedor.innerHTML =
    tarjetaContador('contador-activas', 'Publicaciones activas', estadisticas.activas) +
    tarjetaContador('contador-resueltas', 'Publicaciones resueltas', estadisticas.resueltas);
}
