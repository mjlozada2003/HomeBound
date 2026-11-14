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

