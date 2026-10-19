export function validarCamposLogin(correo, password){
    if(!correo?.trim() || !password?.trim()){
        return {
            esValido:false,
            mensaje: "Por favor, completa todos los campos"
        };
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!regexCorreo.test(correo.trim())){
        return {
            esValido:false,
            mensaje: "El correo electrónico no es válido"
        }
    }
    return {
        esValido:true,
        mensaje:""
    };
};


export const CUENTA_ADMIN_PRECONFIGURADA = {
  nombre: "Administrador HomeBound",
  correo: "admin@homebound.com",
  password: "admin123",
  rol: "ADMIN"
};


export function autenticarUsuario(correo, password, usuarios = []){
    const correoNormalizado = correo.trim().toLowerCase();

    const todosLosUsuarios = [CUENTA_ADMIN_PRECONFIGURADA, ...usuarios];

    const usuarioEncontrado = todosLosUsuarios.find(
        (u) => u.correo.toLowerCase() == correoNormalizado
    );

    if(!usuarioEncontrado  || password !== usuarioEncontrado.password){
        return {
            exito:false,
            mensaje: "Credenciales incorrectas. Verifica tu correo y contraseña."
        };
    }
    return {
        exito:true,
        mensaje: "¡Inicio de sesión exitoso!",
        usuario:{
            nombre:usuarioEncontrado.nombre,
            correo:usuarioEncontrado.correo,
            rol: usuarioEncontrado.rol
        }
    };
};



