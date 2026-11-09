// AI-assisted: see docs/AI_LOG.md #5
// Opciones de las listas desplegables del registro.
// `value` se guarda en la base de datos (en inglés); `label` es el texto visible.
import { PRICING } from './pricing';

const CATEGORY_LABELS = {
  economy: 'Económico',
  xl: 'XL',
  premium: 'Premium',
};

export const REGISTER_OPTIONS = {
  // las categorías salen de pricing.js para que coincidan con las del cálculo de tarifa
  categories: Object.keys(PRICING.categoryMultipliers).map((value) => ({
    value,
    label: CATEGORY_LABELS[value] ?? value,
  })),
  genders: [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
    { value: 'other', label: 'Otro' },
    { value: 'undisclosed', label: 'Prefiero no decirlo' },
  ],
  colors: [
    { value: 'yellow', label: 'Amarillo' },
    { value: 'white', label: 'Blanco' },
    { value: 'black', label: 'Negro' },
    { value: 'gray', label: 'Gris' },
    { value: 'silver', label: 'Plateado' },
    { value: 'red', label: 'Rojo' },
    { value: 'blue', label: 'Azul' },
    { value: 'green', label: 'Verde' },
    { value: 'other', label: 'Otro' },
  ],
  languages: [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ],
};
