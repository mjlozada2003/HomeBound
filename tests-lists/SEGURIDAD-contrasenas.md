# Seguridad: contraseñas cifradas (HU-01 / HU-02)

## Modelo `src/models/Auth/contrasena.js`
1. `cifrarContrasena`: devuelve un hash (64 caracteres hex) distinto a la contraseña.
2. `cifrarContrasena`: misma contraseña y sal → mismo hash.
3. `cifrarContrasena`: si cambia la sal, cambia el hash.
4. `crearCredenciales`: guarda `passwordHash` y `sal`, nunca `password`.
5. `crearCredenciales`: usa una sal distinta cada vez.
6. `verificarContrasena`: acepta la contraseña correcta de un usuario con hash.
7. `verificarContrasena`: rechaza una contraseña incorrecta.
8. `verificarContrasena`: acepta a un usuario antiguo con contraseña sin cifrar (para migrarlo).
9. `verificarContrasena`: rechaza si no hay usuario.
10. `tieneContrasenaSinCifrar`: detecta a los usuarios antiguos que hay que migrar.

## Modelo `src/models/Auth/sesion.js`
11. La cuenta Admin no tiene `password` en el código, solo `passwordHash` y `sal`.
12. Los casos de login de HU-02 siguen pasando (ahora `autenticarUsuario` es async).

## Servicio `src/services/usuarioService.js`
13. El registro guarda `passwordHash` y `sal`, sin `password`.
14. La contraseña guardada se puede verificar.
15. Usuario antiguo que inicia sesión bien → se guarda su hash y se borra `password` (deleteField).
16. Usuario antiguo con contraseña incorrecta → no se migra.

## Pruebas manuales
- Registrar un usuario nuevo y ver en Firebase que solo tiene `passwordHash` y `sal`.
- Iniciar sesión con un usuario antiguo y ver en Firebase que desaparece `password`.
- El Admin sigue entrando con su contraseña de siempre.
