import { iniciarAuthPresenter } from './presenters/authPresenter';
import { iniciarPostPresenter } from './presenters/postPresenter';
import { inicializarListaPresenter } from './presenters/listaPresenter';
import { inicializarModeracionPresenter } from './presenters/moderacionPresenter';

function iniciarAplicacion() {
  iniciarAuthPresenter();
  iniciarPostPresenter();
  inicializarListaPresenter();
  inicializarModeracionPresenter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarAplicacion, { once: true });
} else {
  iniciarAplicacion();
}
