// AI-assisted: see docs/AI_LOG.md #6
// Envío del registro del conductor: fotos a Cloudinary, cuenta en Firebase Auth
// y documento drivers/{uid} en Firestore.
import { buildDriverDocument } from '../utils/buildDriverDocument';
import { requiresTechnicalReview } from '../utils/validators';
import { uploadImage } from './cloudinary';
import {
  auth,
  createUserWithEmailAndPassword,
  db,
  deleteUser,
  doc,
  serverTimestamp,
  setDoc,
  signOut,
} from './firebase';

// sube todas las fotos en paralelo y devuelve sus URLs por nombre
async function uploadPhotos(form, today) {
  const folder = `bolitax/drivers/${form.idNumber.trim()}`;
  const photos = {
    profile: form.profilePhotoUri,
    vehicle: form.vehiclePhotoUri,
    license: form.licensePhotoUri,
    soat: form.soatPhotoUri,
    yellowCard: form.yellowCardPhotoUri,
  };
  if (requiresTechnicalReview(form.year, today)) {
    photos.technicalReview = form.technicalReviewPhotoUri;
  }

  const names = Object.keys(photos);
  const urls = await Promise.all(names.map((name) => uploadImage(photos[name], folder)));
  return Object.fromEntries(names.map((name, index) => [name, urls[index]]));
}

export async function registerDriver(form) {
  const today = new Date();

  // 1. primero las fotos: si fallan, todavía no se ha creado ninguna cuenta
  const photoUrls = await uploadPhotos(form, today);

  // 2. cuenta en Firebase Auth (puede fallar, por ejemplo, si el correo ya existe)
  const credential = await createUserWithEmailAndPassword(
    auth,
    form.email.trim().toLowerCase(),
    form.password,
  );

  // 3. documento del conductor; si falla, se borra la cuenta para poder reintentar
  try {
    await setDoc(doc(db, 'drivers', credential.user.uid), {
      ...buildDriverDocument(form, photoUrls, today),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    try {
      await deleteUser(credential.user);
    } catch (deleteError) {
      // si no se pudo borrar, al menos se cierra la sesión para no quedar en un estado a medias
      console.log('No se pudo borrar la cuenta incompleta:', deleteError);
      await signOut(auth).catch(() => {});
    }
    throw error;
  }
}
