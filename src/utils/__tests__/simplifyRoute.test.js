// AI-assisted: see docs/AI_LOG.md #13
import { simplifyRoute } from '../simplifyRoute';

// ruta de prueba con n puntos: lat = índice, para poder revisar el orden
const makeRoute = (n) => Array.from({ length: n }, (_, i) => ({ lat: i, lng: -75 }));

describe('simplifyRoute', () => {
  test('una ruta corta se devuelve completa', () => {
    expect(simplifyRoute(makeRoute(10), 300)).toHaveLength(10);
  });

  test('una ruta larga se reduce exactamente a maxPoints', () => {
    expect(simplifyRoute(makeRoute(5000), 300)).toHaveLength(300);
  });

  test('conserva el primer y el último punto', () => {
    const result = simplifyRoute(makeRoute(1001), 50);
    expect(result[0].lat).toBe(0);
    expect(result[result.length - 1].lat).toBe(1000);
  });

  test('mantiene el orden del recorrido', () => {
    const lats = simplifyRoute(makeRoute(999), 40).map((point) => point.lat);
    const sorted = [...lats].sort((a, b) => a - b);
    expect(lats).toEqual(sorted);
  });

  test('guarda solo lat y lng', () => {
    const [point] = simplifyRoute([{ lat: 1, lng: 2, extra: 'x' }]);
    expect(point).toEqual({ lat: 1, lng: 2 });
  });

  test('entrada vacía o inválida devuelve una lista vacía', () => {
    expect(simplifyRoute([])).toEqual([]);
    expect(simplifyRoute(null)).toEqual([]);
  });
});
