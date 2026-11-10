// AI-assisted: see docs/AI_LOG.md #18
// Escrituras de "Perfil y configuración" en drivers/{uid}.
// Solo se escriben los campos editables; documento, correo de la cuenta y estado (status)
// no se tocan desde la app (las reglas de Firestore también lo impiden).
import { uploadImage } from './cloudinary';
import { db, doc, updateDoc } from './firebase';

// guarda los cambios del perfil (salida de getProfileChanges) y devuelve lo que se escribió.
// Si cambió la foto (URI local de la cámara o galería), primero se sube a Cloudinary.
export async function updateDriverProfile(uid, idNumber, changes) {
  const update = {};
  if (changes.fullName !== undefined) update.fullName = changes.fullName;
  if (changes.phone !== undefined) update.phone = changes.phone;
  if (changes.mercadoPagoEmail !== undefined) update.mercadoPagoEmail = changes.mercadoPagoEmail;
  if (changes.profilePhotoUri) {
    update.profilePhotoUrl = await uploadImage(changes.profilePhotoUri, `bolitax/drivers/${idNumber}`);
  }
  if (Object.keys(update).length > 0) {
    await updateDoc(doc(db, 'drivers', uid), update);
  }
  return update;
}

// idioma elegido en Perfil (también se guarda en AsyncStorage, desde LanguageContext)
export function updateDriverLanguage(uid, language) {
  return updateDoc(doc(db, 'drivers', uid), { language });
}
