export function validarRegistro(nombre,correo, password){
    if(!nombre?.trim() || !correo?.trim() || !password?.trim()){
        return{
            esValido:false,
            mensaje:"Por favor, completa todos los campos"
        };
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!regexCorreo.test(correo.trim())){
        return {
        esValido :false,
        mensaje : "El correo electrónico no es válido"
        };
    }

    if(password.trim().length < 6){
        return{
            esValido:false,
            mensaje: "La contraseña debe tener al menos 6 caracteres"
        };
    }
    return {
        esValido :true,
        mensaje: ""
    };

}