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
 it("Escenario 3: Debería rechazar si falta el correo", () => {
   const resultadoSinCorreo = validarRegistro("Juan", "", "123456");
   expect(resultadoSinCorreo.esValido).toBe(false);
   expect(resultadoSinCorreo.mensaje).toEqual("Por favor, completa todos los campos")
 });
 it("Escenario 4: Debería rechazar si falta la contraseña", () => {
   const resultadoSinContraseña = validarRegistro("Juan", "juan@gmail.com", "");
   expect(resultadoSinContraseña.esValido).toBe(false);
   expect(resultadoSinContraseña.mensaje).toEqual("Por favor, completa todos los campos")
 });
 it("Escenario 5: Debería rechazar si los campos solo contienen espacios en blanco", () => {
   const resultadoConEspacios = validarRegistro(" ", " ", "  ");
   expect(resultadoConEspacios.esValido).toBe(false);
   expect(resultadoConEspacios.mensaje).toEqual("Por favor, completa todos los campos")
 });


 it("Caso 2 - Escenario 1: Debería rechazar si el correo no tiene arroba", () => {
   const resultadoSinArroba = validarRegistro("Juan", "juanexample.com", "123456");
   expect(resultadoSinArroba.esValido).toBe(false);
   expect(resultadoSinArroba.mensaje).toEqual("El correo electrónico no es válido");
 });
 it("Escenario 2: Debería rechazar si el correo no tiene dominio completo(sin punto)", () => {
   const resultadoSinDominio = validarRegistro("Juan", "juan@gmail", "123456");
   expect(resultadoSinDominio.esValido).toBe(false);
   expect(resultadoSinDominio.mensaje).toEqual("El correo electrónico no es válido");
 })
})