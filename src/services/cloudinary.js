// AI-assisted: see docs/AI_LOG.md #6
// Subida de imágenes a Cloudinary con un upload preset UNSIGNED.
// En la app solo van el cloud name y el nombre del preset (no son secretos);
// el API secret de Cloudinary nunca se usa aquí.
import { File } from 'expo-file-system';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const GENERIC_UPLOAD_MESSAGE = 'No se pudo subir una de las fotos. Inténtalo de nuevo.';

// error de subida con código propio; `cause` guarda el error original para depurar
function uploadError(message, cause) {
  const error = new Error(message);
  error.code = 'cloudinary/upload-failed';
  error.cause = cause;
  return error;
}

// error de red real: usa el mismo código que Firebase para mostrar "sin conexión"
function networkError(cause) {
  const error = new Error('No hay conexión a internet.');
  error.code = 'auth/network-request-failed';
  error.cause = cause;
  return error;
}

// El fetch de Expo arma el body (FormData) ANTES de abrir la conexión; esos errores son Error normales.
// Solo cuando falla la petición nativa (sin red, DNS, timeout) lanza un FetchError,
// cuyo mensaje siempre empieza por "fetch failed:" (expo/build/winter/fetch/FetchErrors.js).
function isNetworkError(error) {
  return typeof error?.message === 'string' && error.message.startsWith('fetch failed:');
}

// sube una imagen local (uri de la cámara o la galería) y devuelve su URL pública https
export async function uploadImage(uri, folder) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw uploadError('Faltan las variables de Cloudinary en el archivo .env.');
  }

  // el fetch de Expo SDK 58 no acepta el objeto { uri, type, name } de React Native dentro
  // de FormData; acepta un File de expo-file-system, del que lee los bytes con file.bytes()
  const file = new File(uri);
  if (!file.exists) {
    throw uploadError('No se encontró una de las fotos en el dispositivo. Vuelve a tomarla.');
  }

  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', UPLOAD_PRESET);
  data.append('folder', folder);

  let response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
    });
  } catch (error) {
    // solo los errores reales de red se muestran como "sin conexión"
    throw isNetworkError(error) ? networkError(error) : uploadError(GENERIC_UPLOAD_MESSAGE, error);
  }

  let result = null;
  try {
    result = await response.json();
  } catch (error) {
    throw uploadError(GENERIC_UPLOAD_MESSAGE, error);
  }
  if (!response.ok || !result?.secure_url) {
    // el detalle de Cloudinary (ej: preset inválido) queda en `cause` para depurar
    throw uploadError(GENERIC_UPLOAD_MESSAGE, result?.error?.message);
  }
  return result.secure_url;
}
