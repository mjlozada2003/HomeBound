import { iniciarAuthPresenter } from './presenters/authPresenter';
import { iniciarPostPresenter } from './presenters/postPresenter';
import { inicializarListaPresenter } from './presenters/listaPresenter';
import { inicializarModeracionPresenter } from './presenters/moderacionPresenter';
import { inicializarMisPublicacionesPresenter } from './presenters/misPublicacionesPresenter';
import { abrirPublicacionPorEnlace } from './presenters/enlaceNavegacion';

function iniciarAplicacion() {
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
