// AI-assisted: see docs/AI_LOG.md #5
// Pestañas del registro (navegación Tab). Cada pestaña muestra un indicador rojo si tiene errores.
// AI-assisted: see docs/AI_LOG.md #20
// Estilo "Damero audaz": barra oscura, íconos, pestaña activa en amarillo con su indicador.
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { useRegister } from '../context/RegisterContext';
import DocumentsTab from '../screens/register/DocumentsTab';
import PersonalDataTab from '../screens/register/PersonalDataTab';
import VehicleTab from '../screens/register/VehicleTab';
import { colors, fonts } from '../theme';

const Tab = createBottomTabNavigator();

// etiqueta de la pestaña con un punto rojo cuando tiene errores visibles
function TabLabel({ title, color, hasErrors }) {
  return (
    <Text style={[styles.label, { color }]}>
      {title}
      {hasErrors ? <Text style={styles.dot}> ●</Text> : null}
    </Text>
  );
}

// ícono de la pestaña con una barra amarilla encima cuando está activa
function TabIcon({ name, color, focused }) {
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.indicator, focused && styles.indicatorActive]} />
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function RegisterTabs() {
  const { tabHasVisibleErrors } = useRegister();

  const tabOptions = (title, tab, icon) => ({
    title,
    tabBarIcon: ({ color, focused }) => <TabIcon name={icon} color={color} focused={focused} />,
    tabBarLabel: ({ color }) => (
      <TabLabel title={title} color={color} hasErrors={tabHasVisibleErrors(tab)} />
    ),
  });

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        sceneStyle: styles.scene,
      }}
    >
      <Tab.Screen
        name="PersonalData"
        component={PersonalDataTab}
        options={tabOptions('Datos personales', 'personal', 'person')}
      />
      <Tab.Screen
        name="Vehicle"
        component={VehicleTab}
        options={tabOptions('Vehículo', 'vehicle', 'car-sport')}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsTab}
        options={tabOptions('Documentos', 'documents', 'document-text')}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 68,
    paddingTop: 6,
  },
  scene: { backgroundColor: colors.background },
  label: { fontFamily: fonts.semibold, fontSize: 12 },
  dot: { color: colors.danger },
  iconWrap: { alignItems: 'center' },
  indicator: { width: 28, height: 3, borderRadius: 2, marginBottom: 4, backgroundColor: 'transparent' },
  indicatorActive: { backgroundColor: colors.primary },
});
