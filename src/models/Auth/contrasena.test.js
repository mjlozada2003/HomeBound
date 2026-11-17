import {
  cifrarContrasena,
  crearCredenciales,
  verificarContrasena,
  tieneContrasenaSinCifrar,
} from './contrasena.js';

describe('Seguridad: contraseñas cifradas', () => {
  describe('cifrarContrasena', () => {
    test('Debería devolver un hash distinto a la contraseña', async () => {
      const hash = await cifrarContrasena('654321', 'sal-de-prueba');

      expect(hash).not.toContain('654321');
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    test('Debería dar el mismo hash para la misma contraseña y sal', async () => {
      expect(await cifrarContrasena('654321', 'sal-1')).toBe(await cifrarContrasena('654321', 'sal-1'));
    });

    test('Debería dar hashes distintos si cambia la sal', async () => {
      expect(await cifrarContrasena('654321', 'sal-1')).not.toBe(await cifrarContrasena('654321', 'sal-2'));
    });
  });

  describe('crearCredenciales', () => {
    test('Debería guardar el hash y la sal, pero no la contraseña', async () => {
      const credenciales = await crearCredenciales('654321');

      expect(credenciales).not.toHaveProperty('password');
      expect(credenciales.sal).toMatch(/^[0-9a-f]{32}$/);
      expect(credenciales.passwordHash).toBe(await cifrarContrasena('654321', credenciales.sal));
    });

    test('Debería usar una sal distinta cada vez', async () => {
      const primera = await crearCredenciales('654321');
      const segunda = await crearCredenciales('654321');

      expect(primera.sal).not.toBe(segunda.sal);
      expect(primera.passwordHash).not.toBe(segunda.passwordHash);
    });
  });

  describe('verificarContrasena', () => {
    test('Debería aceptar la contraseña correcta de un usuario con hash', async () => {
      const usuario = await crearCredenciales('654321');
      expect(await verificarContrasena('654321', usuario)).toBe(true);
    });

    test('Debería rechazar una contraseña incorrecta de un usuario con hash', async () => {
      const usuario = await crearCredenciales('654321');
      expect(await verificarContrasena('123456', usuario)).toBe(false);
    });

    test('Debería aceptar a un usuario antiguo que aún tiene la contraseña sin cifrar', async () => {
      expect(await verificarContrasena('654321', { password: '654321' })).toBe(true);
      expect(await verificarContrasena('123456', { password: '654321' })).toBe(false);
    });

    test('Debería rechazar si no hay usuario', async () => {
      expect(await verificarContrasena('654321', null)).toBe(false);
    });
  });

  describe('tieneContrasenaSinCifrar', () => {
    test('Debería detectar a los usuarios antiguos que hay que migrar', async () => {
      expect(tieneContrasenaSinCifrar({ password: '654321' })).toBe(true);
      expect(tieneContrasenaSinCifrar(await crearCredenciales('654321'))).toBe(false);
      expect(tieneContrasenaSinCifrar(null)).toBe(false);
    });
  });
});
