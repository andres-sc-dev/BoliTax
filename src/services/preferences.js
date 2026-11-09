// AI-assisted: see docs/AI_LOG.md #4
// Preferencias locales del usuario en AsyncStorage.
// Solo datos NO sensibles (idioma). Nunca guardar contraseñas, tokens ni datos de pago.
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = 'preferences:language';
const SUPPORTED_LANGUAGES = ['es', 'en'];
const DEFAULT_LANGUAGE = 'es';

// devuelve el idioma guardado o 'es' si no hay ninguno o falla la lectura
export async function getLanguage() {
  try {
    const value = await AsyncStorage.getItem(LANGUAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(value) ? value : DEFAULT_LANGUAGE;
  } catch (error) {
    console.log('No se pudo leer el idioma:', error);
    return DEFAULT_LANGUAGE;
  }
}

export async function setLanguage(language) {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    throw new Error(`Idioma no soportado: ${language}`);
  }
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.log('No se pudo guardar el idioma:', error);
  }
}

// AI-assisted: see docs/AI_LOG.md #8
// Último estado de disponibilidad (permitido por el PDF: "último estado de disponibilidad").
// La clave incluye el uid para que dos cuentas en el mismo teléfono no se mezclen.
const availabilityKey = (uid) => `preferences:lastAvailability:${uid}`;

export async function getLastAvailability(uid) {
  try {
    return (await AsyncStorage.getItem(availabilityKey(uid))) === 'true';
  } catch (error) {
    console.log('No se pudo leer la disponibilidad guardada:', error);
    return false;
  }
}

export async function setLastAvailability(uid, isAvailable) {
  try {
    await AsyncStorage.setItem(availabilityKey(uid), String(isAvailable));
  } catch (error) {
    console.log('No se pudo guardar la disponibilidad:', error);
  }
}

export async function clearLastAvailability(uid) {
  try {
    await AsyncStorage.removeItem(availabilityKey(uid));
  } catch (error) {
    console.log('No se pudo borrar la disponibilidad guardada:', error);
  }
}
