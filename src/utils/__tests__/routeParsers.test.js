// AI-assisted: see docs/AI_LOG.md #9
// Tests sin red: se usan respuestas de ejemplo con la misma forma que las de OSRM y Nominatim.
import {
  formatShortAddress,
  getNominatimWait,
  isValidLatLng,
  parseOsrmRoute,
} from '../routeParsers';

// devuelve el error lanzado por fn, o null si no lanzó ninguno
function captureError(fn) {
  try {
    fn();
  } catch (error) {
    return error;
  }
  return null;
}

// respuesta de ejemplo de OSRM (/route/v1/driving?overview=full&geometries=geojson)
const OSRM_OK = {
  code: 'Ok',
  routes: [
    {
      distance: 8549.3, // metros
      duration: 1312.6, // segundos
      geometry: {
        type: 'LineString',
        // GeoJSON usa [lng, lat]
        coordinates: [
          [-75.5682, 6.2502],
          [-75.569, 6.23],
          [-75.5675, 6.2088],
        ],
      },
    },
  ],
};

describe('parseOsrmRoute', () => {
  test('convierte metros a km con 1 decimal y segundos a minutos enteros', () => {
    const route = parseOsrmRoute(OSRM_OK);
    expect(route.distanceKm).toBe(8.5);
    expect(route.durationMin).toBe(22);
  });

  test('invierte [lng, lat] a { lat, lng } para dibujar la polilínea', () => {
    const route = parseOsrmRoute(OSRM_OK);
    expect(route.coordinates).toHaveLength(3);
    expect(route.coordinates[0]).toEqual({ lat: 6.2502, lng: -75.5682 });
  });

  test('lanza routing/no-route si OSRM no encuentra ruta', () => {
    expect(() => parseOsrmRoute({ code: 'NoRoute', routes: [] })).toThrow(
      'No se encontró una ruta entre esos dos puntos.',
    );
    expect(captureError(() => parseOsrmRoute({ code: 'NoRoute' }))?.code).toBe('routing/no-route');
  });

  test('lanza error si la geometría tiene menos de 2 puntos', () => {
    const broken = { code: 'Ok', routes: [{ distance: 0, duration: 0, geometry: { coordinates: [] } }] };
    expect(() => parseOsrmRoute(broken)).toThrow();
  });
});

describe('formatShortAddress', () => {
  test('arma calle y número, barrio y ciudad', () => {
    const json = {
      address: {
        road: 'Carrera 50',
        house_number: '52-10',
        neighbourhood: 'La Candelaria',
        city: 'Medellín',
        state: 'Antioquia',
        country: 'Colombia',
      },
    };
    expect(formatShortAddress(json)).toBe('Carrera 50 52-10, La Candelaria, Medellín');
  });

  test('limpia "Perímetro Urbano" (respuesta real para el Parque Berrío)', () => {
    const json = {
      address: {
        amenity: "Dunkin'",
        road: 'Carrera 51',
        neighbourhood: 'La Candelaria',
        suburb: 'Comuna 10 - La Candelaria',
        city: 'Perímetro Urbano Medellín',
        state: 'Antioquia',
      },
    };
    expect(formatShortAddress(json)).toBe('Carrera 51, La Candelaria, Medellín');
  });

  test('omite las partes que no existen', () => {
    expect(formatShortAddress({ address: { road: 'Calle 10', town: 'Envigado' } })).toBe(
      'Calle 10, Envigado',
    );
  });

  test('usa display_name recortado si no hay datos de address', () => {
    const json = { display_name: 'Parque Lleras, El Poblado, Medellín, Antioquia, Colombia' };
    expect(formatShortAddress(json)).toBe('Parque Lleras, El Poblado, Medellín');
  });

  test('lanza routing/no-address si Nominatim responde con error', () => {
    const error = captureError(() => formatShortAddress({ error: 'Unable to geocode' }));
    expect(error?.code).toBe('routing/no-address');
    expect(error?.message).toBe('No se encontró una dirección para esa ubicación.');
  });
});

describe('getNominatimWait', () => {
  test('la primera petición no espera', () => {
    expect(getNominatimWait(null, 5000)).toBe(0);
  });

  test('espera lo que falta para completar 1 segundo', () => {
    expect(getNominatimWait(10000, 10300)).toBe(700);
  });

  test('no espera si ya pasó más de 1 segundo', () => {
    expect(getNominatimWait(10000, 12000)).toBe(0);
  });
});

describe('isValidLatLng', () => {
  test('acepta coordenadas de Medellín', () => {
    expect(isValidLatLng({ lat: 6.2442, lng: -75.5812 })).toBe(true);
  });

  test('rechaza valores fuera de rango, no numéricos o faltantes', () => {
    expect(isValidLatLng({ lat: 91, lng: 0 })).toBe(false);
    expect(isValidLatLng({ lat: '6.2', lng: -75.5 })).toBe(false);
    expect(isValidLatLng(null)).toBe(false);
  });
});
