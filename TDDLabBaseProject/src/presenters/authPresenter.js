import { validarRegistro } from "../models/Auth/cuenta";
import { validarCamposLogin, autenticarUsuario } from "../models/Auth/sesion";

export const usuariosRegistrados = [];

export function iniciarAuthPresenter() {

  // Secciones
  const vistaRegistro = document.querySelector("#vista-registro");
  const vistaLogin = document.querySelector("#vista-login");
  // Enlaces de navegación
  const linkIrLogin = document.querySelector("#link-ir-login");
  const linkIrRegistro = document.querySelector("#link-ir-registro");
  const btnIngresarNav = document.querySelector(".btn-ingresar");

  //Formulario Registro
  const formRegistro = document.querySelector("#registro-form");
  const nombreInput = document.querySelector("#nombre-input");
  const correoInput = document.querySelector("#correo-input");
  const passwordInput = document.querySelector("#password-input");
  const mensajeRegistroDiv = document.querySelector("#mensaje-div");

  // Formulario Login
  const formLogin = document.querySelector("#login-form");
  const loginCorreoInput = document.querySelector("#login-correo-input");
  const loginPasswordInput = document.querySelector("#login-password-input");
  const mensajeLoginDiv = document.querySelector("#login-mensaje-div");

  // Funciones para alternar vistas
  function mostrarLogin() {
    vistaRegistro.classList.add("oculto");
    vistaLogin.classList.remove("oculto");
    mensajeLoginDiv.className = "";
    mensajeLoginDiv.textContent = "";
  }
  function mostrarRegistro() {
    vistaLogin.classList.add("oculto");
    vistaRegistro.classList.remove("oculto");
    mensajeRegistroDiv.className = "";
    mensajeRegistroDiv.textContent = "";
  }
  if (linkIrLogin) linkIrLogin.addEventListener("click", (e) => { e.preventDefault(); mostrarLogin(); });
  if (btnIngresarNav) btnIngresarNav.addEventListener("click", () => mostrarLogin());
  if (linkIrRegistro) linkIrRegistro.addEventListener("click", (e) => { e.preventDefault(); mostrarRegistro(); });




  if (formRegistro){

  formRegistro.addEventListener("submit", (event) => {
    event.preventDefault();

    const nombre = nombreInput.value;
    const correo = correoInput.value;
    const password = passwordInput.value;

    const resultado = validarRegistro(nombre, correo, password);

    if (!resultado.esValido) {
      mensajeRegistroDiv.className = "error";
      mensajeRegistroDiv.textContent = resultado.mensaje;
    } else {
      mensajeRegistroDiv.className = "exito";
      mensajeRegistroDiv.textContent = resultado.mensaje;

      //Guarda al usuario para que pueda autenticarse de inmediato
      usuariosRegistrados.push({
        nombre: resultado.usuario.nombre,
        correo: resultado.usuario.correo,
        password:password,
        rol:"USER"
      });

      formRegistro.reset();
    }
  });
  }


  if(formLogin){
    formLogin.addEventListener("submit", (event) => {
        event.preventDefault();
        const correo = loginCorreoInput.value;
        const password = loginPasswordInput.value;

        const validacionCampos = validarCamposLogin(correo, password);
        if(!validacionCampos.esValido){
            mensajeLoginDiv.className ="error",
            mensajeLoginDiv.textContent = validacionCampos.mensaje;
            return;
        }
        
        //Autenticacion
        const auth = autenticarUsuario(correo, password, usuariosRegistrados);
        if(!auth.exito){
            mensajeLoginDiv.className ="error",
            mensajeLoginDiv.textContent = auth.mensaje;
        }else{
            mensajeLoginDiv.className ="exito",
            mensajeLoginDiv.textContent = `¡Bienvenido, ${auth.usuario.nombre}!`;
            formLogin.reset();            
        }
    });
   } 

}