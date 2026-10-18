export function validarCamposLogin(correo, password){
    if(!correo?.trim() || !password?.trim()){
        return {
            esValido:false,
            mensaje: "Por favor, completa todos los campos"
        };
    }
}