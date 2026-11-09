// AI-assisted: see docs/AI_LOG.md #7
// Ejecuta una función asíncrona y, si falla, la reintenta con una espera entre intentos.
// `sleep` y `shouldContinue` se reciben como parámetros para poder probarla con Jest
// sin esperas reales y para cancelar los reintentos si la pantalla se desmonta.

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retryAsync(
  task,
  { attempts = 3, delayMs = 1500, sleep = wait, shouldContinue = () => true } = {},
) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task(attempt);
    } catch (error) {
      lastError = error;
      // no se espera después del último intento ni si ya no hace falta seguir
      if (attempt === attempts || !shouldContinue()) break;
      await sleep(delayMs);
      if (!shouldContinue()) break;
    }
  }
  throw lastError;
}
