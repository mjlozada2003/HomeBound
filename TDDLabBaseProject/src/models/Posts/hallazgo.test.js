import { validarHallazgo, crearHallazgo } from './hallazgo';

const hoy = new Date(2026, 9, 18, 12);
const finDelDia = new Date(2026, 9, 18, 23, 59);
const foto = { name: 'mochila.jpg', type: 'image/jpeg', size: 1024 };
const hallazgoValido = {
  categoria: 'OBJETO',
  titulo: 'Mochila azul',
  descripcion: 'Encontrada en la plaza.',
  fecha: '2026-10-18',
  fotos: [foto],
  correo: 'contacto@example.com'
};

const validarCon = (cambios, fecha = hoy) => validarHallazgo({ ...hallazgoValido, ...cambios }, fecha);
const rechazo = (mensaje) => ({ esValido: false, mensaje });

describe('HU-03 Caso 1: campos obligatorios', () => {
  it('deberia rechazar categoría, título, descripción o fecha vacíos o con solo espacios', () => {
    for (const campo of ['categoria', 'titulo', 'descripcion', 'fecha']) {
      for (const valor of ['', '   ']) {
        expect(validarCon({ [campo]: valor })).toEqual(rechazo('Completa categoría, título, descripción y fecha'));
      }
    }
  });

  it('deberia rechazar cuando no se proporcionan datos', () => {
    expect(validarHallazgo({}, hoy).esValido).toBe(false);
  });
});

describe('HU-03 Caso 2: categoría del hallazgo', () => {
  it('deberia aceptar OBJETO o MASCOTA', () => {
    for (const categoria of ['OBJETO', 'MASCOTA']) {
      expect(validarCon({ categoria }).esValido).toBe(true);
    }
  });

  it('deberia rechazar OTRO', () => {
    expect(validarCon({ categoria: 'OTRO' })).toEqual(rechazo('Selecciona OBJETO o MASCOTA'));
  });
});

describe('HU-03 Caso 3: fecha existente y con formato YYYY-MM-DD', () => {
  it('deberia rechazar fechas inexistentes, con otro formato o del año 0000', () => {
    for (const fecha of ['2026-02-30', '2025-02-29', '2026-13-01', '18/10/2026', '2026-1-1', '0000-01-01']) {
      expect(validarCon({ fecha })).toEqual(rechazo('Ingresa una fecha válida'));
    }
  });

  it('deberia aceptar el 29 de febrero de un año bisiesto', () => {
    expect(validarCon({ fecha: '2024-02-29' }).esValido).toBe(true);
  });
});

describe('HU-03 Caso 4: fecha del hallazgo no futura', () => {
  it('deberia rechazar una fecha posterior al día local actual', () => {
    expect(validarCon({ fecha: '2026-10-19' })).toEqual(rechazo('La fecha del hallazgo no puede ser futura'));
  });

  it('deberia aceptar hoy o un día anterior', () => {
    for (const fecha of ['2026-10-18', '2026-10-17']) {
      expect(validarCon({ fecha }).esValido).toBe(true);
    }
  });

  it('deberia seguir aceptando la fecha del mismo día al final del día', () => {
    expect(validarCon({}, finDelDia).esValido).toBe(true);
    expect(validarCon({ fecha: '2026-10-19' }, finDelDia).esValido).toBe(false);
  });
});

describe('HU-03 Caso 5: cantidad y formato de las fotos', () => {
  it('deberia exigir al menos una foto en una lista', () => {
    for (const fotos of [undefined, null, [], 'foto.jpg']) {
      expect(validarCon({ fotos })).toEqual(rechazo('Añade al menos una foto'));
    }
  });

  it('deberia aceptar varias fotos JPEG, PNG o WebP', () => {
    const fotos = [
      foto,
      { name: 'detalle.png', type: 'image/png', size: 20 },
      { name: 'otra.webp', type: 'image/webp', size: 30 }
    ];
    expect(validarCon({ fotos }).esValido).toBe(true);
  });

  it('deberia rechazar fotos nulas, vacías o con formato no admitido', () => {
    for (const archivo of [null, { ...foto, size: 0 }, { ...foto, type: 'application/pdf' }]) {
      expect(validarCon({ fotos: [foto, archivo] })).toEqual(rechazo('Usa fotos JPEG, PNG o WebP que no estén vacías'));
    }
  });
});

describe('HU-03 Caso 6: al menos un medio de contacto', () => {
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

  it('deberia aceptar solo correo, solo WhatsApp o ambos', () => {
    for (const contacto of [
      { correo: 'contacto@example.com', whatsapp: '' },
      { correo: '', whatsapp: '+59171234567' },
      { whatsapp: '+59171234567' }
    ]) {
      expect(validarCon(contacto).esValido).toBe(true);
    }
  });
});

describe('HU-03 Caso 7: formato del correo', () => {
  it('deberia rechazar un correo con formato incorrecto', () => {
    expect(validarCon({ correo: 'correo-invalido' })).toEqual(rechazo('El correo electrónico no es válido'));
  });

  it('deberia validar el correo sin los espacios de los extremos', () => {
    expect(validarCon({ correo: ' usuario@example.com ' }).esValido).toBe(true);
  });
});

describe('HU-03 Caso 8: formato de WhatsApp', () => {
  it('deberia rechazar letras, varios +, cantidad de dígitos no admitida o inicio en cero', () => {
    for (const whatsapp of ['abc', '123', '+591+71234567', '0000000']) {
      expect(validarCon({ whatsapp })).toEqual(
        rechazo('Ingresa WhatsApp con código de país, por ejemplo +59171234567')
      );
    }
  });

  it('deberia aceptar código de país con espacios, guiones y paréntesis', () => {
    expect(validarCon({ whatsapp: '+591 (7) 123-4567' }).esValido).toBe(true);
  });
});

describe('HU-03 Caso 9: ubicación opcional de Google Maps', () => {
  it('deberia rechazar enlaces ajenos a Google Maps o con esquema javascript:', () => {
    for (const ubicacion of ['javascript:alert(1)', 'https://example.com', 'https://www.google.com/maps-malicioso']) {
      expect(validarCon({ ubicacion })).toEqual(rechazo('Usa una dirección, coordenadas o un enlace de Google Maps'));
    }
  });
});

describe('HU-03 Caso 10: preparación del hallazgo válido', () => {
  it('deberia preparar el hallazgo normalizado, pendiente de revisión y con sus enlaces', () => {
    const resultado = crearHallazgo({
      ...hallazgoValido,
      titulo: ' Mochila azul ',
      descripcion: ' Encontrada en la plaza. ',
      whatsapp: '+591 (7) 123-4567',
      correo: ' contacto@example.com ',
      ubicacion: ' Plaza Murillo '
    }, hoy);

    expect(resultado.esValido).toBe(true);
    expect(resultado.publicacion).toMatchObject({
      tipo: 'HALLAZGO',
      categoria: 'OBJETO',
      titulo: 'Mochila azul',
      descripcion: 'Encontrada en la plaza.',
      fecha: '2026-10-18',
      estado: 'Pendiente de revisión',
      fotos: [foto],
      contacto: {
        whatsapp: '59171234567',
        enlaceWhatsapp: 'https://wa.me/59171234567',
        correo: 'contacto@example.com',
        enlaceCorreo: 'mailto:contacto@example.com'
      },
      ubicacion: {
        texto: 'Plaza Murillo',
        enlace: 'https://www.google.com/maps/search/?api=1&query=Plaza%20Murillo'
      }
    });
  });

  it('deberia copiar la lista de fotos sin reutilizar el arreglo recibido', () => {
    expect(crearHallazgo(hallazgoValido, hoy).publicacion.fotos).not.toBe(hallazgoValido.fotos);
  });

  it('deberia dejar vacíos los enlaces de los datos que no se proporcionan', () => {
    const { contacto, ubicacion } = crearHallazgo(hallazgoValido, hoy).publicacion;

    expect(contacto.enlaceWhatsapp).toBe('');
    expect(contacto.enlaceCorreo).toBe('mailto:contacto@example.com');
    expect(ubicacion.enlace).toBe('');
  });
});

describe('HU-03 Caso 11: rechazo de un hallazgo inválido', () => {
  it('deberia devolver la validación sin crear la publicación', () => {
    const resultado = crearHallazgo({ ...hallazgoValido, titulo: '' }, hoy);

    expect(resultado).toEqual(rechazo('Completa categoría, título, descripción y fecha'));
    expect(resultado.publicacion).toBeUndefined();
  });
});
