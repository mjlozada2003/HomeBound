import { validarRegistro } from "../models/Auth/cuenta";

export function iniciarAuthPresenter() {
  const form = document.querySelector("#registro-form");
  const nombreInput = document.querySelector("#nombre-input");
  const correoInput = document.querySelector("#correo-input");
  const passwordInput = document.querySelector("#password-input");
  const mensajeDiv = document.querySelector("#mensaje-div");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nombre = nombreInput.value;
    const correo = correoInput.value;
    const password = passwordInput.value;

    const resultado = validarRegistro(nombre, correo, password);

    if (!resultado.esValido) {
      mensajeDiv.className = "error";
      mensajeDiv.textContent = resultado.mensaje;
    } else {
      mensajeDiv.className = "exito";
      mensajeDiv.textContent = resultado.mensaje;
      form.reset();
    }
  });
}