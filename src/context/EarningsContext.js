// AI-assisted: see docs/AI_LOG.md #16
// Comparte el resultado de useEarnings con la pantalla Ganancias y la franja de Inicio.
// El hook se llama UNA sola vez (en AppDrawer): así no hay dos suscripciones a Firestore
// ni se repiten los cálculos.
import { createContext, useContext } from 'react';
import { useEarnings } from '../hooks/useEarnings';
import { useAuth } from './AuthContext';

const EarningsContext = createContext(null);

export function EarningsProvider({ children }) {
  const { user } = useAuth();
  // el objeto que devuelve useEarnings cambia solo cuando cambian sus datos (useMemo interno)
  const earnings = useEarnings(user?.uid ?? null);
  return <EarningsContext.Provider value={earnings}>{children}</EarningsContext.Provider>;
}

export function useEarningsData() {
  const context = useContext(EarningsContext);
  if (!context) {
    throw new Error('useEarningsData debe usarse dentro de EarningsProvider');
  }
  return context;
}
