import { validarCamposLogin } from "./sesion";
import { autenticarUsuario, obtenerSesionActiva, guardarSesion } from "./sesion";

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
    it("Escenario 3: Debería autenticar exitosamente cuando el correo y la contraseña coinciden", () => {
        const resultado = autenticarUsuario("juan@example.com", "password123", usuariosRegistrados);
        expect(resultado.exito).toBe(true);
        expect(resultado.mensaje).toEqual("¡Inicio de sesión exitoso!");
        expect(resultado.usuario.nombre).toEqual("Juan Perez");
    });
    it("Escenario 4: Debería permitir iniciar sesión si el correo se escribió con mayúsculas", () => {
        const resultado = autenticarUsuario("JUAN@EXAMPLE.COM", "password123", usuariosRegistrados);
        expect(resultado.exito).toBe(true);
        expect(resultado.mensaje).toEqual("¡Inicio de sesión exitoso!");
        expect(resultado.usuario.correo).toEqual("juan@example.com");
    });
});

describe("Caso 3: Distinción de roles y Admin preconfigurado", () => {
    it("Escenario 1: Debería autenticar con la cuenta Admin preconfigurada y asignar rol ADMIN", () => {
        const resultadoAdmin = autenticarUsuario("admin@homebound.com", "admin123");
        expect(resultadoAdmin.exito).toBe(true);
        expect(resultadoAdmin.usuario.rol).toEqual("ADMIN");
    });
    it("Escenario 2: Deberia asignar rol USER a un usuario común registrado", () => {
        const usuariosRegistrados = [
        {
        nombre: "Carlos Lopez",
        correo: "carlos@example.com",
        password: "password123"
        }];
        const resultadoUsuario = autenticarUsuario("carlos@example.com", "password123", usuariosRegistrados);
        expect(resultadoUsuario.exito).toBe(true);
        expect(resultadoUsuario.usuario.rol).toEqual("USER");
    });
    it("Escenario 3: Debería rechazar si intentan ingresar como Admin con contraseña incorrecta", () => {
        const resultado = autenticarUsuario("admin@homebound.com", "claveIncorrecta");
        expect(resultado.exito).toBe(false);
        expect(resultado.mensaje).toEqual("Credenciales incorrectas. Verifica tu correo y contraseña.");
    });
});


// Simulación de localStorage para el entorno de pruebas de Node/Jest
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;
describe("Caso 4: Persistencia de sesión y Cerrar sesión", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("Escenario 1: Debería devolver null si no hay sesión activa", () => {
        const sesion = obtenerSesionActiva();
        expect(sesion).toBeNull();
    });
    it("Escenario 2: Debería guardar y recuperar la sesion activa del usuario", () => {
        const usuario = {
        nombre: "Carlos Lopez",
        correo: "carlos@example.com",
        rol: "USER"
        };
        guardarSesion(usuario);
        const sesionActiva = obtenerSesionActiva();
        expect(sesionActiva).not.toBeNull();
        expect(sesionActiva.nombre).toEqual("Carlos Lopez");
        expect(sesionActiva.correo).toEqual("carlos@example.com");
        expect(sesionActiva.rol).toEqual("USER");
    });
})