// AI-assisted: see docs/AI_LOG.md #18
// Idioma de la app (Español / English) con un diccionario propio (src/i18n/translations.js).
// - Al abrir: se lee de AsyncStorage (preferencia local permitida por el PDF).
// - Con sesión: si drivers/{uid}.language existe, manda (así el idioma viaja con la cuenta).
// - Al cambiarlo: se guarda en AsyncStorage y en drivers/{uid}.language.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, translate } from '../i18n/translations';
import { updateDriverLanguage } from '../services/driverProfile';
import { getLanguage, setLanguage } from '../services/preferences';
import { useAuth } from './AuthContext';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { user, driver } = useAuth();
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);

  // preferencia guardada en el teléfono
  useEffect(() => {
    let active = true;
    getLanguage().then((saved) => {
      if (active) setLanguageState(saved);
    });
    return () => {
      active = false;
    };
  }, []);

  // el idioma guardado en la cuenta tiene prioridad (por ejemplo, al iniciar sesión en otro teléfono)
  const driverLanguage = driver?.language;
  useEffect(() => {
    if (SUPPORTED_LANGUAGES.includes(driverLanguage)) {
      setLanguageState(driverLanguage);
      setLanguage(driverLanguage);
    }
  }, [driverLanguage]);

  const uid = user?.uid ?? null;
  const setAppLanguage = useCallback(
    async (next) => {
      if (!SUPPORTED_LANGUAGES.includes(next)) return;
      setLanguageState(next);
      await setLanguage(next);
      if (uid) await updateDriverLanguage(uid, next);
    },
    [uid],
  );

  // t('clave', { valor }) en el idioma actual
  const t = useCallback((key, params) => translate(language, key, params), [language]);

  const value = useMemo(() => ({ language, setAppLanguage, t }), [language, setAppLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de LanguageProvider');
  }
  return context;
}
