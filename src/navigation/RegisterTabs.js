// AI-assisted: see docs/AI_LOG.md #5
// Pestañas del registro (navegación Tab). Cada pestaña muestra un indicador rojo si tiene errores.
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';
import { useRegister } from '../context/RegisterContext';
import DocumentsTab from '../screens/register/DocumentsTab';
import PersonalDataTab from '../screens/register/PersonalDataTab';
import VehicleTab from '../screens/register/VehicleTab';

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

export default function RegisterTabs() {
  const { tabHasVisibleErrors } = useRegister();

  const tabOptions = (title, tab) => ({
    title,
    tabBarIcon: () => null,
    tabBarLabel: ({ color }) => (
      <TabLabel title={title} color={color} hasErrors={tabHasVisibleErrors(tab)} />
    ),
  });

  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarIconStyle: styles.hiddenIcon }}>
      <Tab.Screen
        name="PersonalData"
        component={PersonalDataTab}
        options={tabOptions('Datos personales', 'personal')}
      />
      <Tab.Screen name="Vehicle" component={VehicleTab} options={tabOptions('Vehículo', 'vehicle')} />
      <Tab.Screen
        name="Documents"
        component={DocumentsTab}
        options={tabOptions('Documentos', 'documents')}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600' },
  dot: { color: '#c62828' },
  hiddenIcon: { display: 'none' },
});
