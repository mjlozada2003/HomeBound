import {
  createIcons,
  ArrowLeft,
  ArrowRight,
  Backpack,
  Calendar,
  Camera,
  Check,
  CircleCheck,
  CircleUserRound,
  FileText,
  HandHeart,
  KeyRound,
  LayoutDashboard,
  Link2,
  LogIn,
  LogOut,
  MapPin,
  Package,
  PawPrint,
  Plus,
  Search,
  ShieldCheck,
  X,
} from 'lucide';
import { escaparHtml } from '../models/html';

// Cambia cada <i data-lucide="..."> del HTML por el ícono SVG de la librería Lucide.
// Solo se importan los íconos que usa la app, así el bundle queda pequeño.
export function iniciarIconos() {
  createIcons({
    icons: {
      ArrowLeft,
      ArrowRight,
      Backpack,
      Calendar,
      Camera,
      Check,
      CircleCheck,
      CircleUserRound,
      FileText,
      HandHeart,
      KeyRound,
      LayoutDashboard,
      Link2,
      LogIn,
      LogOut,
      MapPin,
      Package,
      PawPrint,
      Plus,
      Search,
      ShieldCheck,
      X,
    },
    attrs: { class: 'icono', 'aria-hidden': 'true' },
  });
}

// Mismos atributos que usa Lucide; el tamaño y el color los da el CSS (clase "icono").
const ATRIBUTOS_SVG = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'aria-hidden': 'true',
};

function atributosHtml(atributos) {
  return Object.entries(atributos)
    .map(([nombre, valor]) => `${nombre}="${escaparHtml(String(valor))}"`)
    .join(' ');
}

// Convierte un ícono de Lucide (lista de figuras) en texto SVG para usarlo dentro de plantillas HTML.
export function iconoSvg(icono, claseExtra = '') {
  const clase = `icono ${claseExtra}`.trim();
  const figuras = icono
    .map(([etiqueta, atributos]) => `<${etiqueta} ${atributosHtml(atributos)}></${etiqueta}>`)
    .join('');
  return `<svg ${atributosHtml({ ...ATRIBUTOS_SVG, class: clase })}>${figuras}</svg>`;
}
