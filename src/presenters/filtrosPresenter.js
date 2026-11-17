// HU-05: Barra de búsqueda, filtros desplegables y orden de la lista pública.
import { escaparHtml } from '../models/html';
import { obtenerSubcategorias, hayFiltrosActivos, ORDEN } from '../models/Posts/busqueda';

const RETARDO_BUSQUEDA_MS = 300;
const SUBCATEGORIA_OTRA_MASCOTA = 'OTRO';

export function crearOpcionesSubcategoriaHtml(categoria) {
  const opciones = obtenerSubcategorias(categoria);
  if (opciones.length === 0) {
    return '';
  }
  const textoTodas = categoria === 'MASCOTA' ? 'Todas las mascotas' : 'Todos los objetos';
  return [`<option value="">${textoTodas}</option>`]
    .concat(opciones.map(({ valor, texto }) =>
      `<option value="${escaparHtml(valor)}">${escaparHtml(texto)}</option>`))
    .join('');
}

export function leerFiltros(campo) {
  const categoria = campo('categoria').value;
  const subcategoria = campo('subcategoria-grupo').hidden ? '' : campo('subcategoria').value;
  const otraMascota = campo('otra-mascota-grupo').hidden ? '' : campo('otra-mascota').value;
  return {
    texto: campo('texto').value,
    categoria,
    subcategoria,
    otraMascota,
    fecha: campo('fecha').value,
    orden: campo('orden').value || ORDEN.RECIENTES
  };
}

// Conecta los controles y llama a alCambiar(filtros) cada vez que se aplica un filtro.
export function iniciarFiltros(alCambiar) {
  const formulario = document.querySelector('#filtros-publicaciones');
  if (!formulario) {
    return () => ({});
  }
  const campo = (nombre) => document.querySelector('#filtro-' + nombre);
  let temporizador = null;

  const actualizarSubcategorias = () => {
    const opcionesHtml = crearOpcionesSubcategoriaHtml(campo('categoria').value);
    campo('subcategoria').innerHTML = opcionesHtml;
    campo('subcategoria-grupo').hidden = !opcionesHtml;
    actualizarOtraMascota();
  };

  const actualizarOtraMascota = () => {
    const eligioOtraMascota = campo('categoria').value === 'MASCOTA' &&
      campo('subcategoria').value === SUBCATEGORIA_OTRA_MASCOTA;
    campo('otra-mascota-grupo').hidden = !eligioOtraMascota;
    if (!eligioOtraMascota) {
      campo('otra-mascota').value = '';
    }
  };

  const aplicar = () => {
    clearTimeout(temporizador);
    const filtros = leerFiltros(campo);
    campo('limpiar').hidden = !hayFiltrosActivos(filtros);
    alCambiar(filtros);
  };

  // Al escribir se espera un momento para no redibujar la lista en cada tecla.
  const aplicarAlEscribir = () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(aplicar, RETARDO_BUSQUEDA_MS);
  };

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    aplicar();
  });
  campo('texto').addEventListener('input', aplicarAlEscribir);
  campo('otra-mascota').addEventListener('input', aplicarAlEscribir);
  campo('categoria').addEventListener('change', () => {
    actualizarSubcategorias();
    aplicar();
  });
  campo('subcategoria').addEventListener('change', () => {
    actualizarOtraMascota();
    aplicar();
  });
  campo('fecha').addEventListener('change', aplicar);
  campo('orden').addEventListener('change', aplicar);
  formulario.addEventListener('reset', () => {
    // El reset del navegador cambia los valores después de este evento.
    setTimeout(() => {
      actualizarSubcategorias();
      aplicar();
    });
  });

  actualizarSubcategorias();
  return () => leerFiltros(campo);
}
