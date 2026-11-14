import { obtenerIdPublicacionDeUrl } from '../models/Posts/enlacePublicacion';
import { buscarPublicacionPorId } from '../services/publicacionesService';
import { renderizarDetalleEnContenedor } from './detallePresenter';

export async function abrirPublicacionPorEnlace(
  url = (typeof window !== 'undefined' ? window.location.href : ''),
  dependencias = {}
) {
  const extractorId = dependencias.obtenerId || obtenerIdPublicacionDeUrl;
  const buscador = dependencias.buscarPublicacion || buscarPublicacionPorId;
  const renderizador = dependencias.renderizarDetalle || renderizarDetalleEnContenedor;
  const doc = dependencias.documento || (typeof document !== 'undefined' ? document : null);

  const id = extractorId(url);
  if (!id) {
    return false;
  }

  const publicacion = await buscador(id);
  if (!publicacion) {
    return false;
  }

  if (!doc) {
    return true;
  }

  const vistaDetalle = doc.querySelector('#seccion-detalle');
  const contenedorDetalle = doc.querySelector('#contenedor-detalle-publicacion');
  const vistaPublicaciones = doc.querySelector('#seccion-publicaciones');

  const todasLasVistas = doc.querySelectorAll('.vista-publicaciones, .card');
  if (todasLasVistas) {
    todasLasVistas.forEach((vista) => {
      vista.classList.add('oculto');
    });
  }

  if (vistaDetalle) {
    vistaDetalle.classList.remove('oculto');
  }

  renderizador(publicacion, contenedorDetalle, () => {
    if (vistaDetalle) {
      vistaDetalle.classList.add('oculto');
    }
    if (vistaPublicaciones) {
      vistaPublicaciones.classList.remove('oculto');
    }
  });

  return true;
}
