// AI-assisted: see docs/AI_LOG.md #12
// Modo demo (solo __DEV__): mueve la ubicación del conductor a lo largo de la ruta actual.
// - Avanza con un setInterval; la limpieza del useEffect lo detiene.
// - Al terminar se queda en el último punto (el conductor toca los botones manualmente).
// - Si cambia `resetKey` (estado del viaje o foco de la pantalla) o se desmonta la pantalla,
//   la simulación se detiene y vuelve el GPS real.
import { useCallback, useEffect, useState } from 'react';
import { useAvailability } from '../context/AvailabilityContext';
import { pointAtProgress } from '../utils/routeSimulation';

// duración total del recorrido simulado y frecuencia de actualización
const SIMULATION_DURATION_MS = 12000;
const TICK_MS = 400;

export function useRouteSimulation({ coordinates, resetKey }) {
  const { setSimulatedLocation } = useAvailability();
  // 'idle' | 'running' | 'finished'
  const [phase, setPhase] = useState('idle');

  // al cambiar de estado o salir de la pantalla: se detiene y vuelve el GPS real
  useEffect(() => {
    setPhase('idle');
    return () => setSimulatedLocation(null);
  }, [resetKey, setSimulatedLocation]);

  // recorrido: avanza por la ruta en ~12 s
  useEffect(() => {
    if (phase !== 'running' || !coordinates?.length) return undefined;

    const totalSteps = Math.round(SIMULATION_DURATION_MS / TICK_MS);
    let step = 0;
    setSimulatedLocation(pointAtProgress(coordinates, 0));

    const intervalId = setInterval(() => {
      step += 1;
      setSimulatedLocation(pointAtProgress(coordinates, step / totalSteps));
      if (step >= totalSteps) {
        // se queda en el último punto: la ubicación simulada NO se borra aquí
        clearInterval(intervalId);
        setPhase('finished');
      }
    }, TICK_MS);

    return () => clearInterval(intervalId);
  }, [phase, coordinates, setSimulatedLocation]);

  const start = useCallback(() => setPhase('running'), []);

  return { start, running: phase === 'running', finished: phase === 'finished' };
}
