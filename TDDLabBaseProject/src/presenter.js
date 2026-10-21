import { iniciarAuthPresenter } from './presenters/authPresenter';
import { iniciarPostPresenter } from './presenters/postPresenter';
import { inicializarListaPresenter } from './presenters/listaPresenter';

function iniciarAplicacion() {
  iniciarAuthPresenter();
  iniciarPostPresenter();
  inicializarListaPresenter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarAplicacion, { once: true });
} else {
  iniciarAplicacion();
}
