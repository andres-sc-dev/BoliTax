// AI-assisted: see docs/AI_LOG.md #6
import { buildDriverDocument } from '../buildDriverDocument';

const TODAY = new Date(2026, 10, 9);

const FORM = {
  fullName: '  Ana María Pérez ',
  idNumber: '1020304050',
  phone: '3001234567',
  birthDate: new Date(1990, 0, 15),
  gender: 'female',
  email: 'Ana@BoliTax.com ',
  language: 'es',
  password: 'secreto1',
  confirmPassword: 'secreto1',
  category: 'xl',
  plate: 'abc123',
  brand: 'Chevrolet',
  model: 'Spin',
  year: '2020',
  color: 'yellow',
  capacity: '6',
  licenseNumber: '1020304050',
  licenseExpiry: new Date(2030, 0, 1),
  soatExpiry: new Date(2027, 0, 1),
  technicalReviewExpiry: new Date(2027, 0, 1),
  mercadoPagoEmail: 'Pagos@BoliTax.com',
  termsAccepted: true,
};

const URLS = {
  profile: 'https://res.cloudinary.com/demo/profile.jpg',
  vehicle: 'https://res.cloudinary.com/demo/vehicle.jpg',
  license: 'https://res.cloudinary.com/demo/license.jpg',
  soat: 'https://res.cloudinary.com/demo/soat.jpg',
  technicalReview: 'https://res.cloudinary.com/demo/tecno.jpg',
  yellowCard: 'https://res.cloudinary.com/demo/yellow.jpg',
};

describe('buildDriverDocument', () => {
  test('queda en estado pendiente y con la comisión aceptada', () => {
    const result = buildDriverDocument(FORM, URLS, TODAY);
    expect(result.status).toBe('pending');
    expect(result.commissionRateAccepted).toBe(0.2);
  });

  test('nunca incluye la contraseña', () => {
    const json = JSON.stringify(buildDriverDocument(FORM, URLS, TODAY));
    expect(json).not.toContain('secreto1');
    expect(json).not.toContain('password');
  });

  test('normaliza placa, correos, textos y números', () => {
    const result = buildDriverDocument(FORM, URLS, TODAY);
    expect(result.vehicle.plate).toBe('ABC123');
    expect(result.vehicle.year).toBe(2020);
    expect(result.vehicle.capacity).toBe(6);
    expect(result.fullName).toBe('Ana María Pérez');
    expect(result.email).toBe('ana@bolitax.com');
    expect(result.mercadoPagoEmail).toBe('pagos@bolitax.com');
  });

  test('guarda las URLs de Cloudinary de cada foto', () => {
    const result = buildDriverDocument(FORM, URLS, TODAY);
    expect(result.profilePhotoUrl).toBe(URLS.profile);
    expect(result.vehicle.photoUrl).toBe(URLS.vehicle);
    expect(result.documents.license.photoUrl).toBe(URLS.license);
    expect(result.documents.yellowCard.photoUrl).toBe(URLS.yellowCard);
    expect(result.documents.technicalReview.photoUrl).toBe(URLS.technicalReview);
  });

  test('technicalReview es null si el vehículo tiene menos de 2 años', () => {
    const result = buildDriverDocument({ ...FORM, year: '2025' }, URLS, TODAY);
    expect(result.documents.technicalReview).toBeNull();
  });
});
