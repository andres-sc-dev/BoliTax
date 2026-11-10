// AI-assisted: see docs/AI_LOG.md #18
import { getProfileChanges, profileFormFromDriver, validateProfileForm } from '../profileForm';

const DRIVER = {
  profilePhotoUrl: 'https://res.cloudinary.com/demo/perfil.jpg',
  fullName: 'Ana María Pérez',
  phone: '3001234567',
  mercadoPagoEmail: 'pagos@bolitax.com',
  idNumber: '1020304050',
};

describe('profileFormFromDriver', () => {
  test('toma solo los campos editables', () => {
    expect(profileFormFromDriver(DRIVER)).toEqual({
      profilePhotoUri: DRIVER.profilePhotoUrl,
      fullName: DRIVER.fullName,
      phone: DRIVER.phone,
      mercadoPagoEmail: DRIVER.mercadoPagoEmail,
    });
  });
});

describe('validateProfileForm', () => {
  test('un perfil válido no tiene errores', () => {
    const errors = validateProfileForm(profileFormFromDriver(DRIVER));
    expect(Object.values(errors).every((message) => message === null)).toBe(true);
  });

  test('usa las mismas reglas del registro', () => {
    const errors = validateProfileForm({
      ...profileFormFromDriver(DRIVER),
      fullName: 'Ana 2',
      phone: '300',
      mercadoPagoEmail: 'sin-arroba',
      profilePhotoUri: null,
    });
    expect(errors.fullName).toBe('Solo se permiten letras y espacios.');
    expect(errors.phone).not.toBeNull();
    expect(errors.mercadoPagoEmail).not.toBeNull();
    expect(errors.profilePhotoUri).toBe('La foto de perfil es obligatoria.');
  });
});

describe('getProfileChanges', () => {
  const original = profileFormFromDriver(DRIVER);

  test('sin cambios devuelve un objeto vacío', () => {
    expect(getProfileChanges(original, { ...original })).toEqual({});
  });

  test('espacios sobrantes o mayúsculas en el correo no cuentan como cambio', () => {
    expect(
      getProfileChanges(original, {
        ...original,
        fullName: '  Ana María Pérez ',
        mercadoPagoEmail: 'PAGOS@bolitax.com',
      }),
    ).toEqual({});
  });

  test('devuelve solo los campos cambiados, normalizados', () => {
    expect(
      getProfileChanges(original, {
        ...original,
        phone: ' 3109876543 ',
        profilePhotoUri: 'file:///nueva.jpg',
      }),
    ).toEqual({ phone: '3109876543', profilePhotoUri: 'file:///nueva.jpg' });
  });
});
