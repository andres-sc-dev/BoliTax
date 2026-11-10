// AI-assisted: see docs/AI_LOG.md #14
// Funciones puras para reconocer la redirección de Wompi en el WebView.

// true si la URL es la redirect-url del cobro (con o sin parámetros)
export function isRedirectUrl(url, redirectUrl) {
  if (typeof url !== 'string' || typeof redirectUrl !== 'string' || !redirectUrl) return false;
  return url === redirectUrl || url.startsWith(`${redirectUrl}?`) || url.startsWith(`${redirectUrl}#`);
}

// id de la transacción que Wompi agrega a la redirect-url (?id=...); null si no viene
export function getTransactionIdFromUrl(url) {
  if (typeof url !== 'string') return null;
  const match = /[?&]id=([^&#]+)/.exec(url);
  return match ? decodeURIComponent(match[1]) : null;
}
