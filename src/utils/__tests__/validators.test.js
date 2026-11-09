// AI-assisted: see docs/AI_LOG.md #4
import {
  getAge,
  hasErrors,
  normalizePlate,
  requiresTechnicalReview,
  validateBirthDate,
  validateCapacity,
  validateDocumentsTab,
  validateEmail,
  validateFullName,
  validateFutureDate,
  validateIdNumber,
  validateLicenseNumber,
  validateOption,
  validatePassword,
  validatePasswordMatch,
  validatePersonalTab,
  validatePhone,
  validatePlate,
  validateRequired,
  validateTermsAccepted,
  validateText,
  validateVehicleTab,
  validateYear,
} from '../validators';
import { REGISTER_OPTIONS } from '../../config/registerOptions';

describe('validateRequired', () => {
  test('rechaza null, undefined, vacío y solo espacios', () => {
    expect(validateRequired(null)).not.toBeNull();
    expect(validateRequired(undefined)).not.toBeNull();
    expect(validateRequired('')).not.toBeNull();
    expect(validateRequired('   ')).not.toBeNull();
  });

  test('acepta un valor con contenido', () => {
    expect(validateRequired('Ana')).toBeNull();
  });
});

describe('validateEmail', () => {
  test('acepta un correo con @ y dominio', () => {
    expect(validateEmail('conductor@bolitax.com')).toBeNull();
  });

  test('rechaza correos sin @, sin dominio o sin extensión', () => {
    expect(validateEmail('conductorbolitax.com')).not.toBeNull();
    expect(validateEmail('conductor@')).not.toBeNull();
    expect(validateEmail('conductor@bolitax')).not.toBeNull();
  });

  test('rechaza el correo vacío con el mensaje de obligatorio', () => {
    expect(validateEmail('')).toBe('Este campo es obligatorio.');
  });
});

// AI-assisted: see docs/AI_LOG.md #5
// fecha fija para que los tests no dependan del día en que se ejecutan: 9 de noviembre de 2026
const TODAY = new Date(2026, 10, 9);

describe('validateFullName', () => {
  test('acepta letras con tildes, ñ y espacios', () => {
    expect(validateFullName('José Peña Núñez')).toBeNull();
  });

  test('rechaza números o símbolos', () => {
    expect(validateFullName('Ana 2')).not.toBeNull();
    expect(validateFullName('Ana@')).not.toBeNull();
  });

  test('acepta 50 caracteres y rechaza 51', () => {
    expect(validateFullName('a'.repeat(50))).toBeNull();
    expect(validateFullName('a'.repeat(51))).toBe('Máximo 50 caracteres.');
  });
});

describe('validateIdNumber', () => {
  test('acepta entre 6 y 10 dígitos', () => {
    expect(validateIdNumber('123456')).toBeNull();
    expect(validateIdNumber('1234567890')).toBeNull();
  });

  test('rechaza 5 u 11 dígitos y letras', () => {
    expect(validateIdNumber('12345')).not.toBeNull();
    expect(validateIdNumber('12345678901')).not.toBeNull();
    expect(validateIdNumber('12345a')).not.toBeNull();
  });
});

describe('validatePhone', () => {
  test('acepta exactamente 10 dígitos', () => {
    expect(validatePhone('3001234567')).toBeNull();
  });

  test('rechaza 9 u 11 dígitos y caracteres no numéricos', () => {
    expect(validatePhone('300123456')).not.toBeNull();
    expect(validatePhone('30012345678')).not.toBeNull();
    expect(validatePhone('300-123-45')).not.toBeNull();
  });
});

describe('validateBirthDate / getAge', () => {
  test('quien cumple 18 años hoy es mayor de edad', () => {
    const birthDate = new Date(2008, 10, 9);
    expect(getAge(birthDate, TODAY)).toBe(18);
    expect(validateBirthDate(birthDate, TODAY)).toBeNull();
  });

  test('quien cumple 18 años mañana todavía no es mayor de edad', () => {
    expect(validateBirthDate(new Date(2008, 10, 10), TODAY)).toBe('Debes ser mayor de 18 años.');
  });

  test('sin fecha pide seleccionarla', () => {
    expect(validateBirthDate(null, TODAY)).toBe('Selecciona tu fecha de nacimiento.');
  });
});

describe('validatePassword / validatePasswordMatch', () => {
  test('mínimo 6 caracteres', () => {
    expect(validatePassword('12345')).not.toBeNull();
    expect(validatePassword('123456')).toBeNull();
  });

  test('la confirmación debe coincidir', () => {
    expect(validatePasswordMatch('secreto1', 'secreto2')).toBe('Las contraseñas no coinciden.');
    expect(validatePasswordMatch('secreto1', 'secreto1')).toBeNull();
  });
});

describe('validateOption', () => {
  test('solo acepta valores de la lista', () => {
    expect(validateOption('female', REGISTER_OPTIONS.genders)).toBeNull();
    expect(validateOption('', REGISTER_OPTIONS.genders)).not.toBeNull();
    expect(validateOption('pink', REGISTER_OPTIONS.colors)).not.toBeNull();
  });
});

describe('validatePlate', () => {
  test('acepta el formato ABC123', () => {
    expect(validatePlate('ABC123')).toBeNull();
  });

  test('convierte a mayúsculas antes de validar', () => {
    expect(normalizePlate('abc 123')).toBe('ABC123');
    expect(validatePlate('abc123')).toBeNull();
  });

  test('rechaza formatos que no son de carro', () => {
    expect(validatePlate('AB1234')).not.toBeNull();
    expect(validatePlate('ABC12D')).not.toBeNull(); // formato de moto
    expect(validatePlate('ABCD123')).not.toBeNull();
  });
});

describe('validateText (marca y modelo)', () => {
  test('acepta 30 caracteres y rechaza 31', () => {
    expect(validateText('a'.repeat(30), 30)).toBeNull();
    expect(validateText('a'.repeat(31), 30)).toBe('Máximo 30 caracteres.');
  });
});

describe('validateYear', () => {
  test('acepta el año actual y rechaza el siguiente', () => {
    expect(validateYear('2026', TODAY)).toBeNull();
    expect(validateYear('2027', TODAY)).toBe('El año no puede ser mayor al año actual.');
  });

  test('exige 4 dígitos', () => {
    expect(validateYear('202', TODAY)).not.toBeNull();
    expect(validateYear('20a6', TODAY)).not.toBeNull();
  });
});

describe('validateCapacity', () => {
  test('XL exige mínimo 6 pasajeros', () => {
    expect(validateCapacity('5', 'xl')).toBe('La categoría XL exige mínimo 6 pasajeros.');
    expect(validateCapacity('6', 'xl')).toBeNull();
  });

  test('económico acepta 4 pasajeros', () => {
    expect(validateCapacity('4', 'economy')).toBeNull();
  });

  test('rechaza 0 y valores no numéricos', () => {
    expect(validateCapacity('0', 'economy')).not.toBeNull();
    expect(validateCapacity('cuatro', 'economy')).not.toBeNull();
  });
});

describe('validateFutureDate', () => {
  test('mañana es válido', () => {
    expect(validateFutureDate(new Date(2026, 10, 10), TODAY)).toBeNull();
  });

  test('hoy y ayer no son válidos', () => {
    expect(validateFutureDate(new Date(2026, 10, 9, 23, 59), TODAY)).not.toBeNull();
    expect(validateFutureDate(new Date(2026, 10, 8), TODAY)).not.toBeNull();
  });
});

describe('validateLicenseNumber', () => {
  test('obligatorio y solo números', () => {
    expect(validateLicenseNumber('1020304050')).toBeNull();
    expect(validateLicenseNumber('')).not.toBeNull();
    expect(validateLicenseNumber('ABC123')).not.toBeNull();
  });
});

describe('requiresTechnicalReview', () => {
  test('aplica si el vehículo tiene 2 años o más', () => {
    expect(requiresTechnicalReview('2024', TODAY)).toBe(true);
    expect(requiresTechnicalReview('2015', TODAY)).toBe(true);
  });

  test('no aplica para vehículos del año actual o del anterior', () => {
    expect(requiresTechnicalReview('2025', TODAY)).toBe(false);
    expect(requiresTechnicalReview('2026', TODAY)).toBe(false);
  });

  test('no aplica mientras el año no sea válido', () => {
    expect(requiresTechnicalReview('', TODAY)).toBe(false);
  });
});

describe('validateTermsAccepted', () => {
  test('solo es válido si el checkbox está marcado', () => {
    expect(validateTermsAccepted(true)).toBeNull();
    expect(validateTermsAccepted(false)).not.toBeNull();
  });
});

// formulario completo y válido para probar la validación por pestaña
const VALID_FORM = {
  profilePhotoUri: 'file:///perfil.jpg',
  fullName: 'Ana María Pérez',
  idNumber: '1020304050',
  phone: '3001234567',
  birthDate: new Date(1990, 0, 15),
  gender: 'female',
  email: 'ana@bolitax.com',
  language: 'es',
  password: 'secreto1',
  confirmPassword: 'secreto1',
  category: 'economy',
  plate: 'abc123',
  brand: 'Hyundai',
  model: 'Atos',
  year: '2020',
  color: 'yellow',
  capacity: '4',
  vehiclePhotoUri: 'file:///vehiculo.jpg',
  licenseNumber: '1020304050',
  licensePhotoUri: 'file:///licencia.jpg',
  licenseExpiry: new Date(2030, 0, 1),
  soatPhotoUri: 'file:///soat.jpg',
  soatExpiry: new Date(2027, 0, 1),
  technicalReviewPhotoUri: 'file:///tecno.jpg',
  technicalReviewExpiry: new Date(2027, 0, 1),
  yellowCardPhotoUri: 'file:///tarjeta.jpg',
  mercadoPagoEmail: 'pagos@bolitax.com',
  termsAccepted: true,
};

describe('validación por pestaña', () => {
  test('un formulario completo no tiene errores en ninguna pestaña', () => {
    expect(hasErrors(validatePersonalTab(VALID_FORM, REGISTER_OPTIONS, TODAY))).toBe(false);
    expect(hasErrors(validateVehicleTab(VALID_FORM, REGISTER_OPTIONS, TODAY))).toBe(false);
    expect(hasErrors(validateDocumentsTab(VALID_FORM, TODAY))).toBe(false);
  });

  test('un vehículo nuevo no exige técnico-mecánica aunque sus campos estén vacíos', () => {
    const form = {
      ...VALID_FORM,
      year: '2026',
      technicalReviewPhotoUri: null,
      technicalReviewExpiry: null,
    };
    expect(hasErrors(validateDocumentsTab(form, TODAY))).toBe(false);
  });

  test('un vehículo de 2020 sin técnico-mecánica tiene errores', () => {
    const form = { ...VALID_FORM, technicalReviewPhotoUri: null, technicalReviewExpiry: null };
    const errors = validateDocumentsTab(form, TODAY);
    expect(errors.technicalReviewPhotoUri).not.toBeNull();
    expect(errors.technicalReviewExpiry).not.toBeNull();
  });

  test('falta la tarjeta amarilla', () => {
    const form = { ...VALID_FORM, yellowCardPhotoUri: null };
    expect(validateDocumentsTab(form, TODAY).yellowCardPhotoUri).toBe(
      'La foto de la tarjeta amarilla es obligatoria.',
    );
  });
});
