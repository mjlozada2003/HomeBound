import { iniciarIconos } from './presenters/iconos';
import { iniciarAuthPresenter } from './presenters/authPresenter';
import { iniciarPostPresenter } from './presenters/postPresenter';
import { inicializarListaPresenter } from './presenters/listaPresenter';
import { inicializarModeracionPresenter } from './presenters/moderacionPresenter';
import { inicializarMisPublicacionesPresenter } from './presenters/misPublicacionesPresenter';
import { abrirPublicacionPorEnlace } from './presenters/enlaceNavegacion';

function iniciarAplicacion() {
  // Primero los íconos: createIcons reemplaza los <i> por <svg> y los presenters usan esos nodos.
  iniciarIconos();
  const navegacion = iniciarAuthPresenter();
  iniciarPostPresenter({ alVolver: navegacion.mostrarPublicaciones });
  inicializarListaPresenter();
  inicializarModeracionPresenter();
  inicializarMisPublicacionesPresenter();
  abrirPublicacionPorEnlace();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarAplicacion, { once: true });
} else {
  iniciarAplicacion();
}
