// AI-assisted: see docs/AI_LOG.md #5
// Foto con cámara o galería. Por ahora solo se guarda la URI local;
// la subida a Cloudinary se hace al enviar el registro (Fase C).
// AI-assisted: see docs/AI_LOG.md #20 — estilo "Damero audaz" (misma API y lógica)
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

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
        <View style={[styles.preview, uri && styles.previewFilled, shownError && styles.previewError]}>
          {uri ? (
            <Image source={{ uri }} style={styles.image} />
          ) : (
            <Ionicons name="image-outline" size={30} color={colors.textMuted} />
          )}
        </View>
        <View style={styles.buttons}>
          <Pressable style={styles.button} onPress={takePhoto}>
            <Ionicons name="camera" size={18} color={colors.primary} />
            <Text style={styles.buttonText}>Tomar foto</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={pickFromGallery}>
            <Ionicons name="images" size={18} color={colors.primary} />
            <Text style={styles.buttonText}>Elegir de la galería</Text>
          </Pressable>
        </View>
      </View>
      {shownError ? <Text style={styles.error}>{shownError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textMuted, marginBottom: 6 },
  hint: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  preview: {
    width: 92,
    height: 92,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  previewFilled: { borderStyle: 'solid', borderColor: colors.primary },
  previewError: { borderColor: colors.danger },
  image: { width: '100%', height: '100%' },
  buttons: { flex: 1 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  buttonText: { ...typography.label, color: colors.text, marginLeft: spacing.sm },
  error: { ...typography.caption, color: colors.danger, marginTop: 6 },
});
