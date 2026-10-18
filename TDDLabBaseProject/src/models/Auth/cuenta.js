export function validarRegistro(nombre,correo, password){
    if(!nombre?.trim() || !correo?.trim() || !password?.trim()){
        return{
            esValido:false,
            mensaje:"Por favor, completa todos los campos"
        };
    }
    return {
        esValido :true,
        mensaje: ""
    };

}