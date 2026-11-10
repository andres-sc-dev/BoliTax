// AI-assisted: see docs/AI_LOG.md #12
import { canCancel, canTransition, TRIP_TRANSITIONS } from '../tripStatus';

describe('canTransition', () => {
  test('permite el flujo normal del viaje', () => {
    expect(canTransition('requested', 'accepted')).toBe(true);
    expect(canTransition('accepted', 'driver_arriving')).toBe(true);
    expect(canTransition('driver_arriving', 'in_progress')).toBe(true);
    expect(canTransition('in_progress', 'completed')).toBe(true);
    expect(canTransition('completed', 'paid')).toBe(true);
  });

  test('permite rechazar una solicitud', () => {
    expect(canTransition('requested', 'rejected')).toBe(true);
  });

  test('no permite saltar estados', () => {
    expect(canTransition('requested', 'in_progress')).toBe(false);
    expect(canTransition('driver_arriving', 'completed')).toBe(false);
    expect(canTransition('accepted', 'paid')).toBe(false);
  });

  test('no permite volver atrás', () => {
    expect(canTransition('in_progress', 'driver_arriving')).toBe(false);
    expect(canTransition('completed', 'in_progress')).toBe(false);
  });

  test('los estados finales no tienen salida', () => {
    ['paid', 'rejected', 'cancelled'].forEach((status) => {
      expect(TRIP_TRANSITIONS[status]).toEqual([]);
      expect(canTransition(status, 'accepted')).toBe(false);
    });
  });

  test('un estado desconocido o vacío da false', () => {
    expect(canTransition('flying', 'completed')).toBe(false);
    expect(canTransition(undefined, 'accepted')).toBe(false);
  });
});

describe('canCancel', () => {
  test('se puede cancelar antes de recoger al pasajero', () => {
    expect(canCancel('accepted')).toBe(true);
    expect(canCancel('driver_arriving')).toBe(true);
  });

  test('no se puede cancelar con el pasajero a bordo ni después', () => {
    expect(canCancel('in_progress')).toBe(false);
    expect(canCancel('completed')).toBe(false);
    expect(canCancel('paid')).toBe(false);
  });
});
