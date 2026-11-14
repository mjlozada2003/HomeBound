export function generarEnlacePublicacion(id, urlBase) {
  if (!id || typeof id !== 'string' || !id.trim()) {
    return '';
  }

  const idLimpio = id.trim();

  let base = urlBase;
  if (!base && typeof window !== 'undefined' && window.location) {
    base = window.location.origin
      ? `${window.location.origin}${window.location.pathname || '/'}`
      : window.location.href;
  }

  if (!base) {
    return `?id=${encodeURIComponent(idLimpio)}`;
  }

  try {
    const url = new URL(base);
    url.searchParams.set('id', idLimpio);
    return url.toString();
  } catch {
    const separador = base.includes('?') ? '&' : '?';
    return `${base}${separador}id=${encodeURIComponent(idLimpio)}`;
  }
}

export function obtenerIdPublicacionDeUrl(urlCompletaOQuery) {
  if (!urlCompletaOQuery || typeof urlCompletaOQuery !== 'string' || !urlCompletaOQuery.trim()) {
    return null;
  }

  const texto = urlCompletaOQuery.trim();

  try {
    const url = texto.includes('://')
      ? new URL(texto)
      : new URL(texto.startsWith('?') ? texto : `?${texto}`, 'https://homebound.local');

    const id = url.searchParams.get('id');
    return id && id.trim() ? id.trim() : null;
  } catch {
    return null;
  }
}

