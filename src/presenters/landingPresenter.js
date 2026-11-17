import { obtenerPublicacionesPorEstado } from '../services/publicacionesService';
import { ESTADOS } from '../models/Posts/estados.js';
import { obtenerPublicacionesPaginadas } from '../models/Posts/publicaciones.js';
import { elegirPublicacionesDestacadas } from '../models/Posts/destacadas.js';
import { obtenerSesionActiva } from '../models/Auth/sesion';
import { escaparHtml } from '../models/html';
import { crearTarjetaHtml, crearEtiquetasHtml, crearEsqueletosHtml } from './plantillaTarjeta';
import { calcularProgresoSeccion, calcularPasoActivo } from './pasosLanding';

// Videos de fondo del hero (Cloudinary). Se turnan: al terminar uno empieza el otro.
// "q_auto,w_1600,c_limit" le pide a Cloudinary una versión comprimida (de 41 MB a ~3 MB).
// Lista vacía = el hero usa su fondo verde sin video.
export const VIDEOS_FONDO_HERO = [
  'https://res.cloudinary.com/d1d7bvti/video/upload/q_auto,w_1600,c_limit/v1794908067/giving_keys.mp4',
  'https://res.cloudinary.com/d1d7bvti/video/upload/q_auto,w_1600,c_limit/v1794908137/find_your_pet.mp4',
];

const PUBLICACIONES_EN_HERO = 3;
const PUBLICACIONES_RECIENTES = 4;

// Publicaciones reales que la landing no muestra (siguen en la lista pública).
// "calculador": prueba del docente con una foto que no coincide con el título.
const PUBLICACIONES_OCULTAS_EN_LANDING = ['K4LesYmzn596GPC12Goc'];

function reducirMovimiento() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function desplazarA(elemento) {
  if (!elemento) {
    return;
  }
  window.requestAnimationFrame(() => {
    elemento.scrollIntoView({ behavior: reducirMovimiento() ? 'auto' : 'smooth' });
  });
}

// ---------- Navegación de los botones con data-ir (landing y footer) ----------
function crearNavegador(navegacion) {
  const clic = (selector) => document.querySelector(selector)?.click();

  const conSesion = {
    inicio: () => navegacion.mostrarPublicaciones(),
    registro: () => navegacion.mostrarPublicaciones(),
    login: () => navegacion.mostrarPublicaciones(),
    publicaciones: () => navegacion.mostrarPublicaciones(),
    publicar: () => clic('#nav-btn-publicar'),
    'mis-publicaciones': () => clic('#nav-btn-mis-publicaciones'),
  };

  const sinSesion = {
    inicio: () => navegacion.mostrarInicio(),
    registro: () => navegacion.mostrarRegistro(),
    login: () => navegacion.mostrarLogin(),
    publicaciones: () => navegacion.mostrarLogin(),
    publicar: () => navegacion.mostrarLogin(),
    'mis-publicaciones': () => navegacion.mostrarLogin(),
  };

  return (destino) => {
    // Secciones de la landing: se muestran a todos.
    if (destino === 'como-funciona' || destino === 'caracteristicas') {
      navegacion.mostrarInicio();
      desplazarA(document.getElementById(destino));
      return;
    }
    const rutas = obtenerSesionActiva() ? conSesion : sinSesion;
    rutas[destino]?.();
  };
}

// ---------- Videos del hero ----------
function crearVideo(url, indice, unoSolo) {
  const video = document.createElement('video');
  video.className = indice === 0 ? 'hero-video activo' : 'hero-video';
  video.muted = true;
  video.loop = unoSolo;
  video.playsInline = true;
  video.preload = indice === 0 ? 'auto' : 'metadata';
  video.setAttribute('muted', '');
  video.src = url;
  return video;
}

function montarVideosHero(urls) {
  const fondo = document.querySelector('#hero-fondo');
  if (!fondo || urls.length === 0) {
    return;
  }

  const videos = urls.map((url, i) => crearVideo(url, i, urls.length === 1));
  fondo.append(...videos);
  fondo.classList.add('con-video');
  let actual = 0;

  // Con "menos movimiento" el video queda quieto en su primer cuadro.
  if (reducirMovimiento() || !('IntersectionObserver' in window)) {
    return;
  }

  // Al terminar un video empieza el siguiente; el cambio se ve como un fundido (CSS).
  videos.forEach((video, i) => {
    video.addEventListener('ended', () => {
      const siguiente = videos[(i + 1) % videos.length];
      actual = videos.indexOf(siguiente);
      siguiente.currentTime = 0;
      siguiente.addEventListener('playing', () => {
        videos.forEach((v) => v.classList.toggle('activo', v === siguiente));
      }, { once: true });
      siguiente.play().catch(() => {});
    });
  });

  // Solo se reproduce mientras el hero está en pantalla.
  new window.IntersectionObserver(([entrada]) => {
    const video = videos[actual];
    if (entrada.isIntersecting) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }).observe(fondo);
}

// ---------- Cómo funciona: la sección queda fija y el scroll cambia de paso ----------
function iniciarPasos() {
  const seccion = document.querySelector('#como-funciona');
  if (!seccion) {
    return;
  }

  const pasos = Array.from(seccion.querySelectorAll('.paso'));
  const rail = Array.from(seccion.querySelectorAll('.rail-item'));
  const ola = document.querySelector('.hero-ola');
  const pantallaAncha = window.matchMedia('(min-width: 901px)');
  let activo = 0;
  let pendiente = false;

  const mostrarPaso = (indice) => {
    if (indice === activo) {
      return;
    }
    activo = indice;
    pasos.forEach((paso, i) => paso.classList.toggle('activo', i === indice));
    rail.forEach((boton, i) => {
      boton.classList.toggle('activo', i === indice);
      boton.setAttribute('aria-current', i === indice ? 'step' : 'false');
    });
    seccion.dataset.tono = pasos[indice].dataset.tono;
    if (ola) {
      ola.style.fill = window.getComputedStyle(pasos[indice]).getPropertyValue('--fondo');
    }
  };

  const actualizar = () => {
    pendiente = false;
    if (!pantallaAncha.matches || seccion.offsetParent === null) {
      return;
    }
    const caja = seccion.getBoundingClientRect();
    const progreso = calcularProgresoSeccion({
      inicio: caja.top,
      alto: caja.height,
      altoVentana: window.innerHeight,
    });
    mostrarPaso(calcularPasoActivo(progreso, pasos.length));
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!pendiente) {
        pendiente = true;
        window.requestAnimationFrame(actualizar);
      }
    },
    { passive: true }
  );

  // Las rayas del costado también llevan a cada paso (mouse y teclado).
  rail.forEach((boton, indice) => {
    boton.addEventListener('click', () => {
      const caja = seccion.getBoundingClientRect();
      const recorrido = caja.height - window.innerHeight;
      const destino = window.scrollY + caja.top + recorrido * ((indice + 0.5) / pasos.length);
      window.scrollTo({ top: destino, behavior: reducirMovimiento() ? 'auto' : 'smooth' });
    });
  });
}

// ---------- Publicaciones reales en el hero y en "Avisos de esta semana" ----------
function tarjetaLanding(pub, conFecha) {
  const fecha = conFecha
    ? `<p class="tarjeta-fecha"><strong>Fecha:</strong> ${escaparHtml(pub.fecha)}</p>`
    : '';
  const claseExtra = pub.estadoTexto === 'Resuelto' ? 'tarjeta-resuelta' : '';
  return crearTarjetaHtml(pub, `${fecha}${crearEtiquetasHtml(pub)}`, claseExtra);
}

async function cargarPublicacionesReales(irA) {
  const heroTarjetas = document.querySelector('#hero-tarjetas');
  const seccionRecientes = document.querySelector('#landing-recientes');
  const listaRecientes = document.querySelector('#landing-recientes-lista');
  if (!heroTarjetas) {
    return;
  }

  const sinTarjetasEnHero = () => {
    heroTarjetas.innerHTML = '';
    heroTarjetas.closest('.hero-grid')?.classList.add('sin-tarjetas');
  };

  heroTarjetas.innerHTML = crearEsqueletosHtml(PUBLICACIONES_EN_HERO);

  let todas = [];
  try {
    const [activas, resueltas] = await Promise.all([
      obtenerPublicacionesPorEstado(ESTADOS.APROBADA),
      obtenerPublicacionesPorEstado(ESTADOS.RESUELTA),
    ]);
    todas = [...activas, ...resueltas].filter(
      (pub) => !PUBLICACIONES_OCULTAS_EN_LANDING.includes(pub.id)
    );
  } catch {
    sinTarjetasEnHero();
    return;
  }

  // Hero: una de cada estado (encontrada, perdida, resuelta), elegida por el modelo.
  const delHero = elegirPublicacionesDestacadas(todas);
  const idsDelHero = delHero.map((pub) => pub.id);
  // "Avisos de esta semana": las más recientes que no están ya en el hero.
  const recientes = obtenerPublicacionesPaginadas(
    todas.filter((pub) => !idsDelHero.includes(pub.id)),
    1,
    PUBLICACIONES_RECIENTES
  ).publicaciones;

  if (delHero.length === 0) {
    sinTarjetasEnHero();
  } else {
    heroTarjetas.innerHTML = delHero.map((pub) => tarjetaLanding(pub, false)).join('');
  }

  if (seccionRecientes && listaRecientes && recientes.length > 0) {
    listaRecientes.innerHTML = recientes.map((pub) => tarjetaLanding(pub, true)).join('');
    seccionRecientes.classList.remove('oculto');
    // Ver el detalle pide iniciar sesión.
    listaRecientes.addEventListener('click', (evento) => {
      if (evento.target.closest('.tarjeta-publicacion')) {
        irA('publicaciones');
      }
    });
  }
}

// ---------- Animaciones en bucle: solo mientras se ven ----------
function pausarBuclesFueraDePantalla() {
  const conBucle = document.querySelectorAll('[data-loop]');
  if (!('IntersectionObserver' in window)) {
    conBucle.forEach((elemento) => elemento.classList.add('en-pantalla'));
    return;
  }
  const observador = new window.IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      entrada.target.classList.toggle('en-pantalla', entrada.isIntersecting);
    });
  });
  conBucle.forEach((elemento) => observador.observe(elemento));
}

// ---------- La barra gana sombra (y fondo en la landing) al bajar ----------
function iniciarBarraConScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) {
    return;
  }
  const actualizar = () => navbar.classList.toggle('con-scroll', window.scrollY > 8);
  window.addEventListener('scroll', actualizar, { passive: true });
  actualizar();
}

export function iniciarLanding(navegacion) {
  const irA = crearNavegador(navegacion);

  // Un solo listener para todos los botones data-ir (landing y footer).
  document.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-ir]');
    if (boton) {
      irA(boton.dataset.ir);
    }
  });

  document.querySelector('#hero-tarjetas')?.addEventListener('click', (evento) => {
    if (evento.target.closest('.tarjeta-publicacion')) {
      irA('publicaciones');
    }
  });

  iniciarBarraConScroll();
  montarVideosHero(VIDEOS_FONDO_HERO);
  iniciarPasos();
  pausarBuclesFueraDePantalla();
  cargarPublicacionesReales(irA);
}
