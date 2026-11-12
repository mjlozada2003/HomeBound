import { validarRegistro } from '../models/Auth/cuenta';
import {
  validarCamposLogin,
  guardarSesion,
  obtenerSesionActiva,
  cerrarSesion,
  puedeAccederAAdmin,
  puedeAccederAPublicar,
} from '../models/Auth/sesion';
import {
  registrarUsuarioFirebase,
  autenticarUsuarioFirebase,
} from '../services/usuarioService';
import { renderizarListaPublicaciones } from './listaPresenter';
import { renderizarBandejaModeracion } from './moderacionPresenter';
import { renderizarMisPublicaciones } from './misPublicacionesPresenter';

export const usuariosRegistrados = [];

function configurarFormularioRegistro(elementos) {
  const { formRegistro, nombreInput, correoInput, passwordInput, mensajeRegistroDiv } = elementos;
  if (!formRegistro) {
    return;
  }

  formRegistro.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nombre = nombreInput.value;
    const correo = correoInput.value;
    const password = passwordInput.value;

    const resultado = validarRegistro(nombre, correo, password);

    if (!resultado.esValido) {
      mensajeRegistroDiv.className = 'error';
      mensajeRegistroDiv.textContent = resultado.mensaje;
      return;
    }

    mensajeRegistroDiv.className = '';
    mensajeRegistroDiv.textContent = 'Creando cuenta…';

    try {
      const registro = await registrarUsuarioFirebase({
        nombre: resultado.usuario.nombre,
        correo: resultado.usuario.correo,
        password: password,
      });

      if (!registro.exito) {
        mensajeRegistroDiv.className = 'error';
        mensajeRegistroDiv.textContent = registro.mensaje;
      } else {
        mensajeRegistroDiv.className = 'exito';
        mensajeRegistroDiv.textContent = registro.mensaje;

        usuariosRegistrados.push({
          nombre: resultado.usuario.nombre,
          correo: resultado.usuario.correo,
          password: password,
          rol: 'USER',
        });

        formRegistro.reset();
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      mensajeRegistroDiv.className = 'error';
      mensajeRegistroDiv.textContent = 'Error de conexión. Inténtalo de nuevo.';
    }
  });
}

function configurarFormularioLogin(elementos, callbacks) {
  const { formLogin, loginCorreoInput, loginPasswordInput, mensajeLoginDiv } = elementos;
  const { actualizarNavbar, mostrarPublicaciones } = callbacks;
  if (!formLogin) {
    return;
  }

  formLogin.addEventListener('submit', async (event) => {
    event.preventDefault();
    const correo = loginCorreoInput.value;
    const password = loginPasswordInput.value;

    const validacionCampos = validarCamposLogin(correo, password);
    if (!validacionCampos.esValido) {
      mensajeLoginDiv.className = 'error';
      mensajeLoginDiv.textContent = validacionCampos.mensaje;
      return;
    }

    mensajeLoginDiv.className = '';
    mensajeLoginDiv.textContent = 'Iniciando sesión…';

    try {
      const auth = await autenticarUsuarioFirebase(correo, password);
      if (!auth.exito) {
        mensajeLoginDiv.className = 'error';
        mensajeLoginDiv.textContent = auth.mensaje;
      } else {
        mensajeLoginDiv.className = 'exito';
        mensajeLoginDiv.textContent = `¡Bienvenido, ${auth.usuario.nombre}!`;

        guardarSesion(auth.usuario);
        actualizarNavbar(auth.usuario);
        formLogin.reset();
        mostrarPublicaciones();
      }
    } catch (error) {
      console.error('Error al autenticar:', error);
      mensajeLoginDiv.className = 'error';
      mensajeLoginDiv.textContent = 'Error de conexión. Inténtalo de nuevo.';
    }
  });
}

function configurarNavegacionNavbar(elementos, callbacks) {
  const {
    linkIrLogin,
    navBtnIngresar,
    linkIrRegistro,
    brandLogo,
    navBtnLogout,
    btnVolverPublicaciones,
    navBtnPanel,
    navBtnPublicar,
    navBtnMisPublicaciones,
  } = elementos;

  const {
    mostrarLogin,
    mostrarRegistro,
    mostrarPublicaciones,
    mostrarModeracion,
    mostrarHallazgo,
    mostrarMisPublicaciones,
    actualizarNavbar,
  } = callbacks;

  if (linkIrLogin) {
    linkIrLogin.addEventListener('click', (e) => {
      e.preventDefault();
      mostrarLogin();
    });
  }
  if (navBtnIngresar) {
    navBtnIngresar.addEventListener('click', () => mostrarLogin());
  }
  if (linkIrRegistro) {
    linkIrRegistro.addEventListener('click', (e) => {
      e.preventDefault();
      mostrarRegistro();
    });
  }
  if (brandLogo) {
    brandLogo.addEventListener('click', () => {
      const sesion = obtenerSesionActiva();
      if (sesion) {
        mostrarPublicaciones();
      } else {
        mostrarRegistro();
      }
    });
  }
  if (navBtnLogout) {
    navBtnLogout.addEventListener('click', () => {
      cerrarSesion();
      actualizarNavbar(null);
      mostrarLogin();
    });
  }
  if (btnVolverPublicaciones) {
    btnVolverPublicaciones.addEventListener('click', () => {
      mostrarPublicaciones();
    });
  }
  if (navBtnPanel) {
    navBtnPanel.addEventListener('click', () => {
      const sesionActual = obtenerSesionActiva();
      if (!puedeAccederAAdmin(sesionActual)) {
        alert('Acceso denegado: Solo administradores.');
        return;
      }
      mostrarModeracion();
    });
  }
  if (navBtnPublicar) {
    navBtnPublicar.addEventListener('click', () => {
      const sesionActual = obtenerSesionActiva();
      if (!puedeAccederAPublicar(sesionActual)) {
        alert('Debes iniciar sesión para publicar un hallazgo o pérdida.');
        mostrarLogin();
      } else {
        mostrarHallazgo();
      }
    });
  }
  if (navBtnMisPublicaciones) {
    navBtnMisPublicaciones.addEventListener('click', () => mostrarMisPublicaciones());
  }
}

export function iniciarAuthPresenter() {
  // Secciones
  const vistaRegistro = document.querySelector('#vista-registro');
  const vistaLogin = document.querySelector('#vista-login');
  const vistaHallazgo = document.querySelector('#hallazgo-seccion');
  const vistaPerdida = document.querySelector('#perdida-seccion');
  const vistaPublicaciones = document.querySelector('#seccion-publicaciones');
  const vistaModeracion = document.querySelector('#seccion-moderacion');
  const vistaMisPublicaciones = document.querySelector('#seccion-mis-publicaciones');
  const btnVolverPublicaciones = document.querySelector('#btn-volver-publicaciones');

  // Elementos del Navbar
  const navBtnPanel = document.querySelector('#nav-btn-panel');
  const navBtnPublicar = document.querySelector('#nav-btn-publicar');
  const navBtnIngresar = document.querySelector('#nav-btn-ingresar');
  const navUserInfo = document.querySelector('#nav-user-info');
  const navUserName = document.querySelector('#nav-user-name');
  const navBtnLogout = document.querySelector('#nav-btn-logout');
  const navBtnMisPublicaciones = document.querySelector('#nav-btn-mis-publicaciones');
  const brandLogo = document.querySelector('#brand-logo');

  // Enlaces entre pantallas
  const linkIrLogin = document.querySelector('#link-ir-login');
  const linkIrRegistro = document.querySelector('#link-ir-registro');

  // Formulario Registro
  const formRegistro = document.querySelector('#registro-form');
  const nombreInput = document.querySelector('#nombre-input');
  const correoInput = document.querySelector('#correo-input');
  const passwordInput = document.querySelector('#password-input');
  const mensajeRegistroDiv = document.querySelector('#mensaje-div');

  // Formulario Login
  const formLogin = document.querySelector('#login-form');
  const loginCorreoInput = document.querySelector('#login-correo-input');
  const loginPasswordInput = document.querySelector('#login-password-input');
  const mensajeLoginDiv = document.querySelector('#login-mensaje-div');

  // Helper centralizado para alternar vistas (Router SPA)
  const todasLasVistas = [
    vistaRegistro,
    vistaLogin,
    vistaHallazgo,
    vistaPerdida,
    vistaPublicaciones,
    vistaModeracion,
    vistaMisPublicaciones,
  ];

  function activarVista(vistaActiva) {
    todasLasVistas.forEach((vista) => {
      if (vista) {
        vista.classList.add('oculto');
      }
    });
    if (vistaActiva) {
      vistaActiva.classList.remove('oculto');
    }
  }

  function mostrarLogin() {
    activarVista(vistaLogin);
    mensajeLoginDiv.className = '';
    mensajeLoginDiv.textContent = '';
  }

  function mostrarRegistro() {
    activarVista(vistaRegistro);
    mensajeRegistroDiv.className = '';
    mensajeRegistroDiv.textContent = '';
  }

  function mostrarPublicaciones() {
    activarVista(vistaPublicaciones);
    renderizarListaPublicaciones();
  }

  function mostrarModeracion() {
    activarVista(vistaModeracion);
    renderizarBandejaModeracion();
  }

  function mostrarMisPublicaciones() {
    activarVista(vistaMisPublicaciones);
    renderizarMisPublicaciones();
  }

  function mostrarHallazgo() {
    activarVista(vistaHallazgo);
    const categoria = document.querySelector('#hallazgo-categoria');
    if (categoria) {
      categoria.focus();
    }
  }

  function actualizarNavbar(usuario) {
    if (usuario) {
      navBtnIngresar.classList.add('oculto');
      navUserInfo.classList.remove('oculto');
      navUserName.textContent = `👤 ${usuario.nombre}`;
      if (puedeAccederAAdmin(usuario)) {
        navBtnPanel.classList.remove('oculto');
      } else {
        navBtnPanel.classList.add('oculto');
      }
    } else {
      navBtnIngresar.classList.remove('oculto');
      navUserInfo.classList.add('oculto');
      navBtnPanel.classList.add('oculto');
    }
  }

  // Inicialización de submódulos
  configurarFormularioRegistro({
    formRegistro,
    nombreInput,
    correoInput,
    passwordInput,
    mensajeRegistroDiv,
  });

  configurarFormularioLogin(
    { formLogin, loginCorreoInput, loginPasswordInput, mensajeLoginDiv },
    { actualizarNavbar, mostrarPublicaciones }
  );

  configurarNavegacionNavbar(
    {
      linkIrLogin,
      navBtnIngresar,
      linkIrRegistro,
      brandLogo,
      navBtnLogout,
      btnVolverPublicaciones,
      navBtnPanel,
      navBtnPublicar,
      navBtnMisPublicaciones,
    },
    {
      mostrarLogin,
      mostrarRegistro,
      mostrarPublicaciones,
      mostrarModeracion,
      mostrarHallazgo,
      mostrarMisPublicaciones,
      actualizarNavbar,
    }
  );

  // Persistencia al recargar
  const sesionGuardada = obtenerSesionActiva();
  actualizarNavbar(sesionGuardada);
  if (sesionGuardada) {
    mostrarPublicaciones();
  }
}