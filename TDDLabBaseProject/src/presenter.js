import { iniciarAuthPresenter } from "./presenters/authPresenter";
import { inicializarPostPresenter } from "./presenters/postPresenter.js";

// Inicializar los presentadores de la aplicación
document.addEventListener("DOMContentLoaded", () => {
    iniciarAuthPresenter();
    inicializarPostPresenter();
});