import { validarCamposLogin } from "./sesion";
import { autenticarUsuario } from "./sesion";

describe("HU-02: Iniciar sesión - Validaciones de campos", () => {
    it("Caso 1 - Escenario 1: Debería rechazar si ambos campos están vacíos", () => {
        const resultado = validarCamposLogin("","");
        expect(resultado.esValido).toBe(false);
        expect(resultado.mensaje).toEqual("Por favor, completa todos los campos");
    });
    it("Escenario 2: Debería rechazar si falta el correo", () => {
        const resultado = validarCamposLogin("", "123456");
        expect(resultado.esValido).toBe(false);
        expect(resultado.mensaje).toEqual("Por favor, completa todos los campos");
    });
    it("Escenario 3: Debería rechazar si falta la contraseña", () => {
        const resultado = validarCamposLogin("usuario@example.com", "");
        expect(resultado.esValido).toBe(false);
        expect(resultado.mensaje).toEqual("Por favor, completa todos los campos");
    });
    it("Escenario 4: Debería rechazar si los campos solo tienen espacios en blanco", () => {
        const resultado = validarCamposLogin("  ", "  ");
        expect(resultado.esValido).toBe(false);
        expect(resultado.mensaje).toEqual("Por favor, completa todos los campos");
    });
    it("Escenario 5: Debería rechazar si el correo no tiene un formato válido", () => {
        const resultado = validarCamposLogin("correoinvalido", "123456");
        expect(resultado.esValido).toBe(false);
        expect(resultado.mensaje).toEqual("El correo electrónico no es válido");
    });
    it("Escenario 6: Debería aceptar si ambos campos son válidos", () => {
        const resultado = validarCamposLogin("usuario@example.com", "123456");
        expect(resultado.esValido).toBe(true);
        expect(resultado.mensaje).toEqual("");
    });


});

describe("HU-02: Caso 2 - Autenticacion de credenciales", () => {
    const usuariosRegistrados = [
    {
        nombre: "Juan Perez", 
        correo: "juan@example.com",
        password: "password123"
    }];

    it("Caso 2 - Escenario 1: Debería rechazar si el correo no está registrado", () => {
        const resultado = autenticarUsuario("noexiste@gmail.com","123456", usuariosRegistrados);
        expect(resultado.exito).toBe(false);
        expect(resultado.mensaje).toEqual("Credenciales incorrectas. Verifica tu correo y contraseña.");
    });
    it("Escenario 2: Debería rechazar si la contraseña es incorrecta", () => {
        const resultado = autenticarUsuario("juan@example.com", "claveerronea", usuariosRegistrados);
        expect(resultado.exito).toBe(false);
        expect(resultado.mensaje).toEqual("Credenciales incorrectas. Verifica tu correo y contraseña.");
    });
});