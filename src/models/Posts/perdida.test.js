import { validarPerdida, crearPerdida } from './perdida';

const hoy = new Date(2026, 9, 20, 12);
const finDelDia = new Date(2026, 9, 20, 23, 59);
const foto = { name: 'mochila.jpg', type: 'image/jpeg', size: 1024 };
const perdidaValida = {
  categoria: 'OBJETO',
  titulo: 'Mochila azul',
  descripcion: 'Perdida en la plaza.',
  fecha: '2026-10-20',
  fotos: [foto],
  correo: 'contacto@example.com'
};

const validarCon = (cambios, fecha = hoy) => validarPerdida({ ...perdidaValida, ...cambios }, fecha);
const crearCon = (cambios) => crearPerdida({ ...perdidaValida, ...cambios }, hoy);
const rechazo = (mensaje) => ({ esValido: false, mensaje });

describe('HU-04 Caso 1: campos obligatorios', () => {
  it('deberia rechazar categoría, título, descripción o fecha vacíos o con solo espacios', () => {
    for (const campo of ['categoria', 'titulo', 'descripcion', 'fecha']) {
      for (const valor of ['', '   ']) {
        expect(validarCon({ [campo]: valor })).toEqual(rechazo('Completa categoría, título, descripción y fecha'));
      }
    }
  });

  it('deberia rechazar cuando no se proporcionan datos', () => {
    expect(validarPerdida({}, hoy).esValido).toBe(false);
  });
});

describe('HU-04 Caso 2: categorías de la pérdida', () => {
  it('deberia aceptar OBJETO, MASCOTA y OTRO especificado', () => {
    for (const categoria of ['OBJETO', 'MASCOTA', 'OTRO']) {
      expect(validarCon({ categoria, categoriaOtra: 'Documentos' }).esValido).toBe(true);
    }
  });

  it('deberia rechazar una categoría desconocida', () => {
    expect(validarCon({ categoria: 'INVALIDA' })).toEqual(rechazo('Selecciona OBJETO, MASCOTA u OTRO'));
  });
});

describe('HU-04 Caso 3: texto libre para la categoría Otro', () => {
  it('deberia exigir el texto si se elige OTRO y está ausente, vacío o con solo espacios', () => {
    for (const categoriaOtra of [undefined, '', '   ']) {
      expect(validarCon({ categoria: 'OTRO', categoriaOtra })).toEqual(
        rechazo('Especifica la categoría al elegir Otro')
      );
    }
  });

  it('deberia aceptar OTRO con un texto válido', () => {
    expect(validarCon({ categoria: 'OTRO', categoriaOtra: ' Documentos ' }).esValido).toBe(true);
  });

  it('deberia no exigir el texto para OBJETO o MASCOTA', () => {
    expect(validarCon({}).esValido).toBe(true);
  });
});

describe('HU-04 Caso 4: fecha existente y con formato YYYY-MM-DD', () => {
  it('deberia rechazar fechas inexistentes, con otro formato o del año 0000', () => {
    for (const fecha of ['2026-02-30', '2025-02-29', '2026-13-01', '20/10/2026', '2026-1-1', '0000-01-01']) {
      expect(validarCon({ fecha })).toEqual(rechazo('Ingresa una fecha válida'));
    }
  });

  it('deberia aceptar el 29 de febrero de un año bisiesto', () => {
    expect(validarCon({ fecha: '2024-02-29' }).esValido).toBe(true);
  });
});

describe('HU-04 Caso 5: fecha de la pérdida no futura', () => {
  it('deberia rechazar una fecha posterior al día local actual', () => {
    expect(validarCon({ fecha: '2026-10-21' })).toEqual(rechazo('La fecha de la pérdida no puede ser futura'));
  });

  it('deberia aceptar hoy o un día anterior', () => {
    for (const fecha of ['2026-10-20', '2026-10-19']) {
      expect(validarCon({ fecha }).esValido).toBe(true);
    }
  });

  it('deberia seguir aceptando la fecha del mismo día al final del día', () => {
    expect(validarCon({}, finDelDia).esValido).toBe(true);
  });
});

describe('HU-04 Caso 6: cantidad y formato de las fotos', () => {
  it('deberia exigir al menos una foto en una lista', () => {
    for (const fotos of [undefined, null, [], 'foto.jpg']) {
      expect(validarCon({ fotos })).toEqual(rechazo('Añade al menos una foto'));
    }
  });

  it('deberia aceptar varias fotos JPEG, PNG o WebP no vacías', () => {
    expect(validarCon({ fotos: [foto, { ...foto, name: 'detalle.jpg' }] }).esValido).toBe(true);
    expect(validarCon({
      fotos: [foto, { ...foto, type: 'image/png' }, { ...foto, type: 'image/webp' }]
    }).esValido).toBe(true);
  });

  it('deberia rechazar fotos nulas, vacías o con formato no admitido', () => {
    for (const archivo of [null, { ...foto, size: 0 }, { ...foto, type: 'application/pdf' }]) {
      expect(validarCon({ fotos: [foto, archivo] })).toEqual(rechazo('Usa fotos JPEG, PNG o WebP que no estén vacías'));
    }
  });
});

describe('HU-04 Caso 7: al menos un medio de contacto', () => {
  it('deberia rechazar si correo y WhatsApp están ausentes, vacíos o con solo espacios', () => {
    for (const contacto of [
      { correo: undefined, whatsapp: undefined },
      { correo: '', whatsapp: '' },
      { correo: '   ', whatsapp: '   ' }
    ]) {
      expect(validarCon(contacto)).toEqual(
        rechazo('Ingresa al menos un medio de contacto: WhatsApp o correo electrónico.')
      );
    }
  });

  it('deberia aceptar solo correo o solo WhatsApp', () => {
    expect(validarCon({}).esValido).toBe(true);
    expect(validarCon({ correo: '', whatsapp: '+59171234567' }).esValido).toBe(true);
  });
});

describe('HU-04 Caso 8: formato del correo y de WhatsApp', () => {
  it('deberia rechazar un correo con formato incorrecto', () => {
    expect(validarCon({ correo: 'correo-invalido' })).toEqual(rechazo('El correo electrónico no es válido'));
  });

  it('deberia validar el correo sin los espacios de los extremos', () => {
    expect(validarCon({ correo: ' contacto@example.com ' }).esValido).toBe(true);
  });

  it('deberia rechazar WhatsApp con letras, varios +, dígitos no admitidos o inicio en cero', () => {
    for (const whatsapp of ['abc', '123', '+591+71234567', '0000000']) {
      expect(validarCon({ whatsapp })).toEqual(
        rechazo('Ingresa WhatsApp con código de país, por ejemplo +59171234567')
      );
    }
  });

  it('deberia aceptar WhatsApp con código de país y separadores admitidos', () => {
    expect(validarCon({ whatsapp: '+591 (7) 123-4567' }).esValido).toBe(true);
  });
});

describe('HU-04 Caso 9: ubicación opcional de Google Maps', () => {
  it('deberia rechazar enlaces de otro sitio o con esquema no admitido', () => {
    for (const ubicacion of ['javascript:alert(1)', 'https://example.com', 'https://www.google.com/maps-malicioso']) {
      expect(validarCon({ ubicacion })).toEqual(rechazo('Usa una dirección, coordenadas o un enlace de Google Maps'));
    }
  });

  it('deberia aceptar ubicación vacía, dirección, coordenadas o enlace de Google Maps', () => {
    for (const ubicacion of ['', 'Plaza Murillo', '-16.5, -68.15', 'https://maps.app.goo.gl/ejemplo']) {
      expect(validarCon({ ubicacion }).esValido).toBe(true);
    }
  });

  it('deberia guardar el texto sin espacios y su enlace de Maps', () => {
    expect(crearCon({ ubicacion: ' Plaza Murillo ' }).publicacion.ubicacion).toEqual({
      texto: 'Plaza Murillo',
      enlace: 'https://www.google.com/maps/search/?api=1&query=Plaza%20Murillo'
    });
  });

  it('deberia guardar texto y enlace vacíos si no hay ubicación', () => {
    expect(crearCon({}).publicacion.ubicacion).toEqual({ texto: '', enlace: '' });
  });
});

describe('HU-04 Caso 10: preparación de la pérdida válida', () => {
  it('deberia crear una pérdida pendiente de revisión con textos normalizados', () => {
    const resultado = crearCon({ titulo: ' Mochila azul ', descripcion: ' Perdida en la plaza. ' });

    expect(resultado.esValido).toBe(true);
    expect(resultado.publicacion).toMatchObject({
      tipo: 'PERDIDA',
      categoria: 'OBJETO',
      titulo: 'Mochila azul',
      descripcion: 'Perdida en la plaza.',
      fecha: '2026-10-20',
      estado: 'Pendiente de revisión',
      fotos: [foto]
    });
  });

  it('deberia copiar la lista de fotos sin reutilizar el arreglo recibido', () => {
    expect(crearCon({}).publicacion.fotos).not.toBe(perdidaValida.fotos);
  });

  it('deberia guardar categoriaOtra sin espacios solo si se elige OTRO', () => {
    expect(crearCon({ categoria: 'OTRO', categoriaOtra: ' Documentos ' }).publicacion).toMatchObject({
      categoria: 'OTRO',
      categoriaOtra: 'Documentos'
    });
    expect(crearCon({ categoriaOtra: 'Texto anterior' }).publicacion.categoriaOtra).toBe('');
  });

  it('deberia normalizar los contactos y generar sus enlaces directos', () => {
    expect(crearCon({ correo: ' contacto@example.com ', whatsapp: '+591 (7) 123-4567' }).publicacion.contacto).toEqual({
      correo: 'contacto@example.com',
      whatsapp: '59171234567',
      enlaceCorreo: 'mailto:contacto@example.com',
      enlaceWhatsapp: 'https://wa.me/59171234567'
    });
  });

  it('deberia dejar vacío el enlace del contacto que no se proporciona', () => {
    expect(crearCon({}).publicacion.contacto.enlaceWhatsapp).toBe('');
    expect(crearCon({ correo: '', whatsapp: '+59171234567' }).publicacion.contacto.enlaceCorreo).toBe('');
  });
});

describe('HU-04 Caso 11: rechazo de una pérdida inválida', () => {
  it('deberia devolver la validación sin crear la publicación', () => {
    const resultado = crearCon({ titulo: '' });

    expect(resultado).toEqual(rechazo('Completa categoría, título, descripción y fecha'));
    expect(resultado.publicacion).toBeUndefined();
  });
});
