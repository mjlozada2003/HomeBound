const REEMPLAZOS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
};

export function escaparHtml(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (caracter) => REEMPLAZOS[caracter]);
}
