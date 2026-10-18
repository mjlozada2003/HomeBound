import { validarRegistro } from "./cuenta";

describe("HU-01: Crear cuenta - Validaciones de registro", () => {
 it("Caso 1: Debería rechazar el registro si algún campo está vacío", () => {
    //Escenario 1: 
    const resultadoTodosVacíos = validarRegistro("","","");
    expect(resultadoTodosVacíos.esValido).toBe(false);
    expect(resultadoTodosVacíos.mensaje).toEqual("Por favor, completa todos los campos");
 });
 it("Escenario 2: Debería rechazar si falta el nombre", () => {
   const resultadoSinNombre = validarRegistro("", "juan@gmail.com", "123456");
   expect(resultadoSinNombre.esValido).toBe(false);
   expect(resultadoSinNombre.mensaje).toEqual("Por favor, completa todos los campos");
 });
 
})