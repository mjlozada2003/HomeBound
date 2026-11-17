import { cifrarContrasena } from './contrasena.js';

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
});
