// AI-assisted: see docs/AI_LOG.md #5
// Foto con cámara o galería. Por ahora solo se guarda la URI local;
// la subida a Cloudinary se hace al enviar el registro (Fase C).
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

// calidad reducida para que la subida posterior sea más liviana
const PICKER_OPTIONS = { mediaTypes: ['images'], quality: 0.6 };

export default function PhotoField({ label, hint, uri, onChange, error }) {
  // error de permisos: se muestra debajo del campo, no en un Alert
  const [permissionError, setPermissionError] = useState(null);

  const handleResult = (result) => {
    if (!result.canceled && result.assets?.length) {
      onChange(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setPermissionError('Debes permitir el acceso a la cámara o elegir una foto de la galería.');
      return;
    }
    setPermissionError(null);
    handleResult(await ImagePicker.launchCameraAsync(PICKER_OPTIONS));
  };

  const pickFromGallery = async () => {
    setPermissionError(null);
    handleResult(await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
  };

  const shownError = permissionError ?? error;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.row}>
        <View style={[styles.preview, shownError && styles.previewError]}>
          {uri ? (
            <Image source={{ uri }} style={styles.image} />
          ) : (
            <Text style={styles.noPhoto}>Sin foto</Text>
          )}
        </View>
        <View style={styles.buttons}>
          <Pressable style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>Tomar foto</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={pickFromGallery}>
            <Text style={styles.buttonText}>Elegir de la galería</Text>
          </Pressable>
        </View>
      </View>
      {shownError ? <Text style={styles.error}>{shownError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#222' },
  hint: { fontSize: 13, color: '#666', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  preview: {
    width: 88,
    height: 88,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  previewError: { borderColor: '#c62828' },
  image: { width: '100%', height: '100%' },
  noPhoto: { color: '#999', fontSize: 12 },
  buttons: { flex: 1 },
  button: {
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: { fontSize: 14, fontWeight: '600', color: '#111' },
  error: { color: '#c62828', fontSize: 13, marginTop: 4 },
});
