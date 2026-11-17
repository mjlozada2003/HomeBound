import { esCorreoValido, normalizarCorreo } from './validadorCorreo';
import { verificarContrasena } from './contrasena';

export function validarCamposLogin(correo, password){
    if(!correo?.trim() || !password?.trim()){
        return {
            esValido:false,
            mensaje: 'Por favor, completa todos los campos'
        };
    }

    if(!esCorreoValido(correo)){
        return {
            esValido:false,
            mensaje: 'El correo electrónico no es válido'
        };
    }
    return {
        esValido:true,
        mensaje:''
    };
};


// La contraseña del Admin no se escribe en el código: solo su hash PBKDF2 y la sal.
export const CUENTA_ADMIN_PRECONFIGURADA = {
  nombre: 'Administrador HomeBound',
  correo: 'admin@homebound.com',
  passwordHash: 'ce65674611f7bdd4a6448705cc121c900470da7f88bd1a40de45d7068af44d78',
  sal: '7450a8284d3c5bc106d3cec389b20bfa',
  rol: 'ADMIN'
};


export async function autenticarUsuario(correo, password, usuarios = []) {
  const correoNormalizado = normalizarCorreo(correo);
  const todosLosUsuarios = [CUENTA_ADMIN_PRECONFIGURADA, ...usuarios];

  const usuarioEncontrado = todosLosUsuarios.find(
    (u) => normalizarCorreo(u.correo) === correoNormalizado
  );

  if (!(await verificarContrasena(password, usuarioEncontrado))) {
    return {
      exito: false,
      mensaje: 'Credenciales incorrectas. Verifica tu correo y contraseña.',
    };
  }

  return {
    exito: true,
    mensaje: '¡Inicio de sesión exitoso!',
    usuario: {
      nombre: usuarioEncontrado.nombre,
      correo: usuarioEncontrado.correo,
      rol: usuarioEncontrado.rol || 'USER',
    },
  };
}

const CLAVE_SESION = 'homebound_sesion_activa';
export function obtenerSesionActiva(){
    if (typeof localStorage === 'undefined') {return null;}
    const datos = localStorage.getItem(CLAVE_SESION);
    if(!datos) {return null;}
    try{
        return JSON.parse(datos);
    }catch{
        return null;
    }
}
export function guardarSesion(usuario){
    if (!usuario || typeof localStorage === 'undefined') {return;}
    localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
}

export function cerrarSesion(){
    if (typeof localStorage === 'undefined') {return;}
    localStorage.removeItem(CLAVE_SESION);
}

export function puedeAccederAPublicar(usuario){
    return usuario !== null && usuario !== undefined && !!usuario.correo;
}
export function puedeAccederAAdmin(usuario) {
  return usuario !== null && usuario !== undefined && usuario.rol === 'ADMIN';
}

