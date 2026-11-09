// AI-assisted: see docs/AI_LOG.md #6
// Arma el documento drivers/{uid} a partir del formulario y las URLs de Cloudinary.
// Función pura: no guarda nada, solo transforma datos (por eso se puede probar con Jest).
// La contraseña NUNCA se incluye: solo la maneja Firebase Auth.
import { PRICING } from '../config/pricing';
import { normalizePlate, requiresTechnicalReview } from './validators';

export function buildDriverDocument(form, photoUrls, today) {
  const needsTechnicalReview = requiresTechnicalReview(form.year, today);

  return {
    fullName: form.fullName.trim(),
    idNumber: form.idNumber.trim(),
    phone: form.phone.trim(),
    birthDate: form.birthDate,
    gender: form.gender,
    email: form.email.trim().toLowerCase(),
    language: form.language,
    profilePhotoUrl: photoUrls.profile,
    vehicle: {
      category: form.category,
      plate: normalizePlate(form.plate),
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      color: form.color,
      capacity: Number(form.capacity),
      photoUrl: photoUrls.vehicle,
    },
    documents: {
      license: {
        number: form.licenseNumber.trim(),
        expiryDate: form.licenseExpiry,
        photoUrl: photoUrls.license,
      },
      soat: { expiryDate: form.soatExpiry, photoUrl: photoUrls.soat },
      // null cuando el vehículo tiene menos de 2 años
      technicalReview: needsTechnicalReview
        ? { expiryDate: form.technicalReviewExpiry, photoUrl: photoUrls.technicalReview }
        : null,
      yellowCard: { photoUrl: photoUrls.yellowCard },
    },
    mercadoPagoEmail: form.mercadoPagoEmail.trim().toLowerCase(),
    termsAccepted: true,
    // comisión que el conductor aceptó al registrarse
    commissionRateAccepted: PRICING.commissionRate,
    // la cuenta queda pendiente hasta que se cambie a "approved" en la base de datos
    status: 'pending',
  };
}
