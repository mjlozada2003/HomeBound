import { validarRegistro } from "./cuenta";

describe("HU-01: Crear cuenta - Validaciones de registro", () => {
 it("Caso 1: Debería rechazar el registro si algún campo está vacío", () => {
    //Escenario 1: 
    const resultadoTodosVacíos = validarRegistro("","","");
    expect(resultadoTodosVacíos.esValido).toBe(false);
    expect(resultadoTodosVacíos.mensaje).toEqual("Por favor, completa todos los campos");


 })
})