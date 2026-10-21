import {
  crearHallazgo,
  crearEnlaceMapa,
  fechaLocal
} from '../models/Posts/hallazgo';

import { crearPerdida } from '../models/Posts/perdida';
import { guardarHallazgo } from '../services/hallazgoService';
import { guardarPerdida } from '../services/perdidaService';

import {
  obtenerSesionActiva,
  puedeAccederAPublicar
} from '../models/Auth/sesion';

export async function enviarHallazgo(
  datos,
  guardar = guardarHallazgo,
  hoy = new Date()
) {
  const resultado = crearHallazgo(datos, hoy);

  if (!resultado.esValido) {
    return resultado;
  }

  try {
    const publicacion = await guardar(resultado.publicacion);

    return {
      esValido: true,
      mensaje: 'Hallazgo enviado. Pendiente de revisión.',
      publicacion
    };
  } catch {
    return {
      esValido: false,
      mensaje: 'No se pudo enviar el hallazgo. Conservamos tus datos para que lo intentes de nuevo.'
    };
  }
}

export function iniciarPostPresenter({
  guardar = guardarHallazgo,
  ahora = () => new Date()
} = {}) {
  iniciarFormularioPerdida(guardarPerdida, ahora);

  const form = document.querySelector('#hallazgo-form');

  if (!form) {
    return;
  }

  const campo = (nombre) =>
    document.querySelector('#hallazgo-' + nombre);

  const boton = campo('enviar');
  const mensaje = campo('mensaje');
  let enviando = false;

  campo('fecha').max = fechaLocal(ahora());

  form.addEventListener('focusin', () => {
    campo('fecha').max = fechaLocal(ahora());
  });

  campo('ubicacion').addEventListener('input', () => {
    const enlace = crearEnlaceMapa(campo('ubicacion').value);
    campo('maps').href = enlace || 'https://www.google.com/maps';
  });

  function mostrarEnlace(elemento, enlace) {
    elemento.hidden = !enlace;

    if (enlace) {
      elemento.href = enlace;
    } else {
      elemento.removeAttribute('href');
    }
  }

  function mostrarResumen(publicacion) {
    campo('resumen-titulo').textContent = publicacion.titulo;
    campo('resumen-detalles').textContent = publicacion.descripcion;
    campo('resumen-fotos').replaceChildren();

    for (const url of publicacion.fotos) {
      const imagen = document.createElement('img');
      imagen.src = url;
      imagen.alt = publicacion.titulo;
      campo('resumen-fotos').append(imagen);
    }

    mostrarEnlace(
      campo('contacto-whatsapp'),
      publicacion.contacto.enlaceWhatsapp
    );

    mostrarEnlace(
      campo('contacto-correo'),
      publicacion.contacto.enlaceCorreo
    );

    campo('contacto-whatsapp').textContent =
      'WhatsApp: +' + publicacion.contacto.whatsapp;

    campo('contacto-correo').textContent =
      publicacion.contacto.correo;

    mostrarEnlace(
      campo('resumen-maps'),
      publicacion.ubicacion.enlace
    );

    campo('resumen').hidden = false;
  }

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    if (enviando) {
      return;
    }

    if (!puedeAccederAPublicar(obtenerSesionActiva())) {
      mensaje.className = 'error';
      mensaje.textContent =
        'Debes iniciar sesión para publicar un hallazgo.';
      return;
    }

    const datos = {
      categoria: campo('categoria').value,
      titulo: campo('nombre').value,
      descripcion: campo('descripcion').value,
      fecha: campo('fecha').value,
      fotos: Array.from(campo('fotos').files),
      ubicacion: campo('ubicacion').value,
      whatsapp: campo('whatsapp').value,
      correo: campo('correo').value
    };

    enviando = true;
    boton.disabled = true;
    mensaje.className = '';
    mensaje.textContent = 'Enviando hallazgo…';
    campo('resumen').hidden = true;

    try {
      const resultado = await enviarHallazgo(datos, guardar, ahora());

      mensaje.className = resultado.esValido ? 'exito' : 'error';
      mensaje.textContent = resultado.mensaje;

      if (resultado.esValido) {
        mostrarResumen(resultado.publicacion);
        form.reset();
        campo('maps').href = 'https://www.google.com/maps';
      }
    } finally {
      enviando = false;
      boton.disabled = false;
      campo('fecha').max = fechaLocal(ahora());
    }
  });
}

export async function enviarPerdida(
  datos,
  guardar = guardarPerdida,
  hoy = new Date()
) {
  const resultado = crearPerdida(datos, hoy);

  if (!resultado.esValido) {
    return resultado;
  }

  try {
    const publicacion = await guardar(resultado.publicacion);

    return {
      esValido: true,
      mensaje: 'Pérdida enviada. Pendiente de revisión.',
      publicacion
    };
  } catch {
    return {
      esValido: false,
      mensaje: 'No se pudo enviar la pérdida. Conservamos tus datos para que lo intentes de nuevo.'
    };
  }
}

function iniciarFormularioPerdida(guardar, ahora) {
  const form = document.querySelector('#perdida-form');

  if (!form) {
    return;
  }

  const campo = (nombre) =>
    document.querySelector('#perdida-' + nombre);

  const boton = campo('enviar');
  const mensaje = campo('mensaje');
  let enviando = false;

  function actualizarOtraCategoria() {
    const esOtra = campo('categoria').value === 'OTRO';

    campo('categoria-otra-grupo').hidden = !esOtra;
    campo('categoria-otra').disabled = !esOtra;
    campo('categoria-otra').required = esOtra;

    if (!esOtra) {
      campo('categoria-otra').value = '';
    }
  }

  campo('categoria').addEventListener(
    'change',
    actualizarOtraCategoria
  );

  actualizarOtraCategoria();

  campo('fecha').max = fechaLocal(ahora());

  form.addEventListener('focusin', () => {
    campo('fecha').max = fechaLocal(ahora());
  });

  campo('ubicacion').addEventListener('input', () => {
    const enlace = crearEnlaceMapa(campo('ubicacion').value);
    campo('maps').href = enlace || 'https://www.google.com/maps';
  });

  document.querySelector('#hallazgo-ir-perdida')
    .addEventListener('click', () => {
      if (!puedeAccederAPublicar(obtenerSesionActiva())) {
        document.querySelector('#nav-btn-ingresar').click();
        return;
      }

      document.querySelector('#hallazgo-seccion')
        .classList.add('oculto');

      campo('seccion').classList.remove('oculto');
      campo('fecha').max = fechaLocal(ahora());
      campo('categoria').focus();
    });

  document.querySelector('#perdida-ir-hallazgo')
    .addEventListener('click', () => {
      document.querySelector('#nav-btn-publicar').click();
    });

  function mostrarEnlace(elemento, enlace) {
    elemento.hidden = !enlace;

    if (enlace) {
      elemento.href = enlace;
    } else {
      elemento.removeAttribute('href');
    }
  }

  function mostrarResumen(publicacion) {
    campo('resumen-titulo').textContent = publicacion.titulo;
    campo('resumen-detalles').textContent = publicacion.descripcion;
    campo('resumen-fotos').replaceChildren();

    for (const url of publicacion.fotos) {
      const imagen = document.createElement('img');
      imagen.src = url;
      imagen.alt = publicacion.titulo;
      campo('resumen-fotos').append(imagen);
    }

    mostrarEnlace(
      campo('contacto-whatsapp'),
      publicacion.contacto.enlaceWhatsapp
    );

    mostrarEnlace(
      campo('contacto-correo'),
      publicacion.contacto.enlaceCorreo
    );

    campo('contacto-whatsapp').textContent =
      'WhatsApp: +' + publicacion.contacto.whatsapp;

    campo('contacto-correo').textContent =
      publicacion.contacto.correo;

    mostrarEnlace(
      campo('resumen-maps'),
      publicacion.ubicacion.enlace
    );

    campo('resumen').hidden = false;
  }

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    if (enviando) {
      return;
    }

    if (!puedeAccederAPublicar(obtenerSesionActiva())) {
      mensaje.className = 'error';
      mensaje.textContent =
        'Debes iniciar sesión para publicar una pérdida.';
      return;
    }

    const datos = {
      categoria: campo('categoria').value,
      categoriaOtra: campo('categoria-otra').value,
      titulo: campo('nombre').value,
      descripcion: campo('descripcion').value,
      fecha: campo('fecha').value,
      fotos: Array.from(campo('fotos').files),
      ubicacion: campo('ubicacion').value,
      whatsapp: campo('whatsapp').value,
      correo: campo('correo').value
    };

    enviando = true;
    boton.disabled = true;
    mensaje.className = '';
    mensaje.textContent = 'Enviando pérdida…';
    campo('resumen').hidden = true;

    try {
      const resultado = await enviarPerdida(datos, guardar, ahora());

      mensaje.className = resultado.esValido ? 'exito' : 'error';
      mensaje.textContent = resultado.mensaje;

      if (resultado.esValido) {
        mostrarResumen(resultado.publicacion);
        form.reset();
        actualizarOtraCategoria();
        campo('maps').href = 'https://www.google.com/maps';
      }
    } finally {
      enviando = false;
      boton.disabled = false;
      campo('fecha').max = fechaLocal(ahora());
    }
  });
}
