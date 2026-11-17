import { guardarBorrador, obtenerBorrador, eliminarBorrador } from './borradorService.js';

function crearLocalStorageFalso() {
  const datos = {};
  return {
    getItem: (clave) => (clave in datos ? datos[clave] : null),
    setItem: (clave, valor) => {
      datos[clave] = String(valor);
    },
    removeItem: (clave) => {
      delete datos[clave];
    },
  };
}

describe('Servicio de borradores de publicación', () => {
  const clave = 'borrador-hallazgo-maite@ucb.edu.bo';

  beforeEach(() => {
    globalThis.localStorage = crearLocalStorageFalso();
  });

  afterEach(() => {
    delete globalThis.localStorage;
  });

  test('Debería guardar un borrador y recuperarlo igual', () => {
    guardarBorrador(clave, { titulo: 'Mochila azul' });
    expect(obtenerBorrador(clave)).toEqual({ titulo: 'Mochila azul' });
  });

  test('Debería responder null si no hay borrador guardado', () => {
    expect(obtenerBorrador(clave)).toBeNull();
  });

  test('Debería responder null si el borrador guardado está dañado', () => {
    localStorage.setItem(clave, '{no es json');
    expect(obtenerBorrador(clave)).toBeNull();
  });

  test('Debería eliminar el borrador', () => {
    guardarBorrador(clave, { titulo: 'Mochila azul' });
    eliminarBorrador(clave);
    expect(obtenerBorrador(clave)).toBeNull();
  });
});
