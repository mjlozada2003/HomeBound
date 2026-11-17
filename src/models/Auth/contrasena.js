// Las contraseñas nunca se guardan tal cual: se guarda un hash PBKDF2 con una sal propia de cada usuario.
// Se usa la Web Crypto API (crypto.subtle), que existe en el navegador y en Node.

const ITERACIONES = 100000;

function aHexadecimal(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function cifrarContrasena(password, sal) {
  const codificador = new globalThis.TextEncoder();
  const clave = await globalThis.crypto.subtle.importKey(
    'raw',
    codificador.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: codificador.encode(sal), iterations: ITERACIONES },
    clave,
    256
  );
  return aHexadecimal(bits);
}
