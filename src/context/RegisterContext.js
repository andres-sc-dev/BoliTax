// AI-assisted: see docs/AI_LOG.md #5
// Estado del formulario de registro compartido por las 3 pestañas,
// para no perder los datos al cambiar de pestaña.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { REGISTER_OPTIONS } from '../config/registerOptions';
import { getLanguage } from '../services/preferences';
import {
  hasErrors,
  validateDocumentsTab,
  validatePersonalTab,
  validateVehicleTab,
} from '../utils/validators';

// valores iniciales: textos vacíos, fechas y fotos en null (son obligatorios y se validan)
const INITIAL_FORM = {
  // pestaña 1: datos personales
  profilePhotoUri: null,
  fullName: '',
  idNumber: '',
  phone: '',
  birthDate: null,
  gender: null,
  email: '',
  language: 'es',
  password: '',
  confirmPassword: '',
  // pestaña 2: vehículo
  category: null,
  plate: '',
  brand: '',
  model: '',
  year: '',
  color: null,
  capacity: '',
  vehiclePhotoUri: null,
  // pestaña 3: documentos y pagos
  licenseNumber: '',
  licensePhotoUri: null,
  licenseExpiry: null,
  soatPhotoUri: null,
  soatExpiry: null,
  technicalReviewPhotoUri: null,
  technicalReviewExpiry: null,
  yellowCardPhotoUri: null,
  mercadoPagoEmail: '',
  termsAccepted: false,
};

const RegisterContext = createContext(null);

export function RegisterProvider({ children }) {
  const [form, setForm] = useState(INITIAL_FORM);
  // campos que el usuario ya tocó: solo a esos se les muestra el error
  const [touched, setTouched] = useState({});

  // el idioma inicial es la preferencia guardada en AsyncStorage
  useEffect(() => {
    let active = true;
    getLanguage().then((language) => {
      if (active) setForm((prev) => ({ ...prev, language }));
    });
    // limpieza: evita actualizar el estado si la pantalla se cerró antes de leer
    return () => {
      active = false;
    };
  }, []);

  const setField = useCallback((name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const touchFields = useCallback((names) => {
    setTouched((prev) => {
      const next = { ...prev };
      names.forEach((name) => {
        next[name] = true;
      });
      return next;
    });
  }, []);

  // cambia el valor y lo marca como tocado (para selectores, fechas, fotos y checkbox)
  const setAndTouch = useCallback(
    (name, value) => {
      setField(name, value);
      touchFields([name]);
    },
    [setField, touchFields],
  );

  // los errores se recalculan solo cuando cambia el formulario
  const errors = useMemo(() => {
    const today = new Date();
    return {
      personal: validatePersonalTab(form, REGISTER_OPTIONS, today),
      vehicle: validateVehicleTab(form, REGISTER_OPTIONS, today),
      documents: validateDocumentsTab(form, today),
    };
  }, [form]);

  const tabValid = useMemo(
    () => ({
      personal: !hasErrors(errors.personal),
      vehicle: !hasErrors(errors.vehicle),
      documents: !hasErrors(errors.documents),
    }),
    [errors],
  );

  // marca como tocados todos los campos de una pestaña (al salir de ella)
  const touchTab = useCallback(
    (tab) => touchFields(Object.keys(errors[tab])),
    [errors, touchFields],
  );

  // error visible de un campo: solo si ya fue tocado
  const getError = useCallback(
    (tab, name) => (touched[name] ? errors[tab][name] : null),
    [errors, touched],
  );

  // la pestaña muestra indicador si alguno de sus errores ya es visible
  const tabHasVisibleErrors = useCallback(
    (tab) => Object.keys(errors[tab]).some((name) => touched[name] && errors[tab][name]),
    [errors, touched],
  );

  const value = useMemo(
    () => ({
      form,
      setField,
      setAndTouch,
      touchFields,
      touchTab,
      getError,
      tabValid,
      tabHasVisibleErrors,
      allValid: tabValid.personal && tabValid.vehicle && tabValid.documents,
    }),
    [form, setField, setAndTouch, touchFields, touchTab, getError, tabValid, tabHasVisibleErrors],
  );

  return <RegisterContext.Provider value={value}>{children}</RegisterContext.Provider>;
}

// al salir de una pestaña se marcan todos sus campos como tocados,
// así se muestran sus errores y el indicador en la barra de pestañas
export function useTouchTabOnBlur(navigation, tab) {
  const { touchTab } = useRegister();
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => touchTab(tab));
    return unsubscribe;
  }, [navigation, tab, touchTab]);
}

export function useRegister() {
  const context = useContext(RegisterContext);
  if (!context) {
    throw new Error('useRegister debe usarse dentro de RegisterProvider');
  }
  return context;
}
