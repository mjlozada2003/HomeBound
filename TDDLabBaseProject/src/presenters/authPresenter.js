import { validarRegistro } from "../models/Auth/cuenta";
import { validarCamposLogin, autenticarUsuario, guardarSesion, obtenerSesionActiva, cerrarSesion, puedeAccederAAdmin, puedeAccederAPublicar } from "../models/Auth/sesion";

export const usuariosRegistrados = [];

export function iniciarAuthPresenter() {

  // Secciones
  const vistaRegistro = document.querySelector("#vista-registro");
  const vistaLogin = document.querySelector("#vista-login");
  const vistaHallazgo = document.querySelector("#hallazgo-seccion");
  const vistaPerdida = document.querySelector("#perdida-seccion");

  // Elementos del Navbar
  const navBtnPanel = document.querySelector("#nav-btn-panel");
  const navBtnPublicar = document.querySelector("#nav-btn-publicar");
  const navBtnIngresar = document.querySelector("#nav-btn-ingresar");
  const navUserInfo = document.querySelector("#nav-user-info");
  const navUserName = document.querySelector("#nav-user-name");
  const navBtnLogout = document.querySelector("#nav-btn-logout");
  const brandLogo = document.querySelector("#brand-logo");

  // Enlaces entre pantallas
  const linkIrLogin = document.querySelector("#link-ir-login");
  const linkIrRegistro = document.querySelector("#link-ir-registro");

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
  vistaHallazgo.classList.add("oculto");
  vistaPerdida.classList.add("oculto");
  vistaRegistro.classList.add("oculto");
  vistaLogin.classList.remove("oculto");
  mensajeLoginDiv.className = "";
  mensajeLoginDiv.textContent = "";
}

function mostrarRegistro() {
  vistaHallazgo.classList.add("oculto");
  vistaPerdida.classList.add("oculto");
  vistaLogin.classList.add("oculto");
  vistaRegistro.classList.remove("oculto");
  mensajeRegistroDiv.className = "";
  mensajeRegistroDiv.textContent = "";
}

  // Actualiza el Navbar según si hay sesión iniciada y el rol del usuario
  function actualizarNavbar(usuario) {
    if (usuario) {
      navBtnIngresar.classList.add("oculto");
      navUserInfo.classList.remove("oculto");
      navUserName.textContent = `👤 ${usuario.nombre}`;

      // Distinción de rol Admin
      if (puedeAccederAAdmin(usuario)) {
        navBtnPanel.classList.remove("oculto");
      } else {
        navBtnPanel.classList.add("oculto");
      }
    } else {
      navBtnIngresar.classList.remove("oculto");
      navUserInfo.classList.add("oculto");
      navBtnPanel.classList.add("oculto");
    }
  }

  if (linkIrLogin) linkIrLogin.addEventListener("click", (e) => { e.preventDefault(); mostrarLogin(); });
  if (navBtnIngresar) navBtnIngresar.addEventListener("click", () => mostrarLogin());
  if (linkIrRegistro) linkIrRegistro.addEventListener("click", (e) => { e.preventDefault(); mostrarRegistro(); });
  if(brandLogo) brandLogo.addEventListener("click", () => mostrarRegistro());




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

            //Guardar sesion
            guardarSesion(auth.usuario);
            actualizarNavbar(auth.usuario);

            formLogin.reset();
        }
    });
   }

   //Cerrar Sesión
   if(navBtnLogout){
    navBtnLogout.addEventListener("click", () => {
        cerrarSesion();
        actualizarNavbar(null);
        mostrarLogin();
    });
   }

   //Proteccion de pantallas
   if(navBtnPublicar){
    navBtnPublicar.addEventListener("click", () => {
        const sesionActual = obtenerSesionActiva();
        if(!puedeAccederAPublicar(sesionActual)){
            alert("Debes iniciar sesión para publicar un hallazgo o pérdida.");
            mostrarLogin();
        }else{
            vistaRegistro.classList.add("oculto");
            vistaLogin.classList.add("oculto");
            vistaPerdida.classList.add("oculto");
            vistaHallazgo.classList.remove("oculto");
            document.querySelector("#hallazgo-categoria").focus();
        }
    });
   }

   //persistencia al recargar
   const sesionGuardada = obtenerSesionActiva();
   actualizarNavbar(sesionGuardada);

}