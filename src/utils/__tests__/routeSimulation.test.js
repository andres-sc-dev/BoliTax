// AI-assisted: see docs/AI_LOG.md #12
import { distanceKm, pointAtProgress } from '../routeSimulation';

// ruta recta sobre el ecuador: 3 puntos, el segundo tramo mide el doble que el primero
const ROUTE = [
  { lat: 0, lng: 0 },
  { lat: 0, lng: 1 },
  { lat: 0, lng: 3 },
];

const expectPoint = (point, lat, lng) => {
  expect(point.lat).toBeCloseTo(lat, 6);
  expect(point.lng).toBeCloseTo(lng, 6);
};

describe('distanceKm', () => {
  test('un grado de longitud en el ecuador mide unos 111 km', () => {
    expect(distanceKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })).toBeCloseTo(111.19, 1);
  });
});

describe('pointAtProgress', () => {
  test('0 es el inicio y 1 es el final de la ruta', () => {
    expectPoint(pointAtProgress(ROUTE, 0), 0, 0);
    expectPoint(pointAtProgress(ROUTE, 1), 0, 3);
  });

  test('interpola por distancia, no por número de puntos', () => {
    // a mitad de camino (1,5 de 3 grados) ya pasó el segundo punto
    expectPoint(pointAtProgress(ROUTE, 0.5), 0, 1.5);
    // un tercio del recorrido coincide con el segundo punto
    expectPoint(pointAtProgress(ROUTE, 1 / 3), 0, 1);
  });

  test('recorta valores fuera de 0..1', () => {
    expectPoint(pointAtProgress(ROUTE, -0.5), 0, 0);
    expectPoint(pointAtProgress(ROUTE, 2), 0, 3);
  });

  test('rutas vacías o de un solo punto', () => {
    expect(pointAtProgress([], 0.5)).toBeNull();
    expect(pointAtProgress(null, 0.5)).toBeNull();
    expectPoint(pointAtProgress([{ lat: 6.2, lng: -75.5 }], 0.7), 6.2, -75.5);
  });

  test('puntos repetidos (largo 0) no producen NaN', () => {
    const point = pointAtProgress(
      [
        { lat: 1, lng: 1 },
        { lat: 1, lng: 1 },
      ],
      0.5,
    );
    expectPoint(point, 1, 1);
  });
});
