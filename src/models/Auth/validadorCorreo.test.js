import { esCorreoValido, normalizarCorreo } from './validadorCorreo';

describe('Validador de Correo Compartido', () => {
    it('debería aceptar correos validos estadar', () =>{
        expect(esCorreoValido('usuario@example.com')).toBe(true);
        expect(esCorreoValido('maria.lopez@gmail.com')).toBe(true);
    });
    it('debería aceptar correros con espacios al inicio o al final', () => {
        expect(esCorreoValido('  usuario@example.com   ')).toBe(true);
    });
    it('debería rechazar correos sin arroba', () => {
        expect(esCorreoValido('usuarioexample.com')).toBe(false);
    });
    it('debería rechazar correos sin dominio o sin extension', () => {
        expect(esCorreoValido('usuario@')).toBe(false);
        expect(esCorreoValido('usuario@gmail')).toBe(false);
    });
    it('debería rechazar correos con espacios intermedios', () => {
        expect(esCorreoValido('usuario perez@gmail.com')).toBe(false);
    });
    it('deberia rechazar valores vacios, nulos o no cadenas', () => {
        expect(esCorreoValido('')).toBe(false);
        expect(esCorreoValido('   ')).toBe(false);
        expect(esCorreoValido(null)).toBe(false);
        expect(esCorreoValido(undefined)).toBe(false);
    });
    it('deberia normalizar correos eliminando espacios y convirtiendo a minusculas', () => {
        expect(normalizarCorreo('  Usuario@Example.COM  ')).toBe('usuario@example.com');
    });

    it('deberia devolver cadena vacia si el valor no es una cadena', () => {
        expect(normalizarCorreo(null)).toBe('');
        expect(normalizarCorreo(undefined)).toBe('');
    });
});