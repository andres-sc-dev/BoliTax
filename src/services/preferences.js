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
