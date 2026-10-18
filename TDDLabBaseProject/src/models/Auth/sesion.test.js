import { validarCamposLogin } from "./sesion";

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
  
    })
})