import {
  createIcons,
  CircleUserRound,
  FileText,
  LayoutDashboard,
  LogIn,
  LogOut,
  Plus,
  ShieldCheck,
} from 'lucide';

// Cambia cada <i data-lucide="..."> del HTML por el ícono SVG de la librería Lucide.
// Solo se importan los íconos que usa la app, así el bundle queda pequeño.
export function iniciarIconos() {
  createIcons({
    icons: { CircleUserRound, FileText, LayoutDashboard, LogIn, LogOut, Plus, ShieldCheck },
  });
}
