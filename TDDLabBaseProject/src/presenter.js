import { iniciarAuthPresenter } from './presenters/authPresenter';
import {
  iniciarPostPresenter,
  inicializarPostPresenter
} from './presenters/postPresenter';

function iniciarAplicacion() {
  iniciarAuthPresenter();
  iniciarPostPresenter();
  inicializarPostPresenter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarAplicacion, { once: true });
} else {
  iniciarAplicacion();
}
