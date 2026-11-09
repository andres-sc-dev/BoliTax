// AI-assisted: see docs/AI_LOG.md #5
// Pantalla de registro: comparte el estado del formulario entre las 3 pestañas.
import { RegisterProvider } from '../../context/RegisterContext';
import RegisterTabs from '../../navigation/RegisterTabs';

export default function RegisterScreen() {
  return (
    <RegisterProvider>
      <RegisterTabs />
    </RegisterProvider>
  );
}
