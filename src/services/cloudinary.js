// AI-assisted: see docs/AI_LOG.md #6
// Subida de imágenes a Cloudinary con un upload preset UNSIGNED.
// En la app solo van el cloud name y el nombre del preset (no son secretos);
// el API secret de Cloudinary nunca se usa aquí.

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// error con un código propio para que la pantalla sepa cómo mostrarlo
function uploadError(message) {
  const error = new Error(message);
  error.code = 'cloudinary/upload-failed';
  return error;
}

// sube una imagen local (uri de la cámara o la galería) y devuelve su URL pública https
export async function uploadImage(uri, folder) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw uploadError('Faltan las variables de Cloudinary en el archivo .env.');
  }

  const data = new FormData();
  // React Native envía el archivo a partir de su uri local
  data.append('file', { uri, type: 'image/jpeg', name: `photo-${Date.now()}.jpg` });
  data.append('upload_preset', UPLOAD_PRESET);
  data.append('folder', folder);

  let response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
    });
  } catch (networkError) {
    // fetch solo falla así cuando no hay conexión
    const error = new Error('No hay conexión a internet.');
    error.code = 'auth/network-request-failed';
    throw error;
  }

  const result = await response.json();
  if (!response.ok || !result.secure_url) {
    throw uploadError(result?.error?.message ?? 'Cloudinary rechazó la imagen.');
  }
  return result.secure_url;
}
