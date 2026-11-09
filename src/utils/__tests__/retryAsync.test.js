// AI-assisted: see docs/AI_LOG.md #7
import { retryAsync } from '../retryAsync';

// espera falsa: no demora los tests, solo registra cuánto se habría esperado
const fakeSleep = jest.fn(() => Promise.resolve());

beforeEach(() => fakeSleep.mockClear());

describe('retryAsync', () => {
  test('devuelve el resultado al primer intento sin esperar', async () => {
    const task = jest.fn().mockResolvedValue('ok');
    await expect(retryAsync(task, { sleep: fakeSleep })).resolves.toBe('ok');
    expect(task).toHaveBeenCalledTimes(1);
    expect(fakeSleep).not.toHaveBeenCalled();
  });

  test('reintenta tras un fallo y devuelve el resultado del segundo intento', async () => {
    const task = jest.fn().mockRejectedValueOnce(new Error('sin posición')).mockResolvedValue('ok');
    await expect(retryAsync(task, { sleep: fakeSleep, delayMs: 2000 })).resolves.toBe('ok');
    expect(task).toHaveBeenCalledTimes(2);
    expect(fakeSleep).toHaveBeenCalledWith(2000);
  });

  test('lanza el último error si fallan todos los intentos', async () => {
    const task = jest.fn().mockRejectedValue(new Error('sin posición'));
    await expect(retryAsync(task, { attempts: 3, sleep: fakeSleep })).rejects.toThrow('sin posición');
    expect(task).toHaveBeenCalledTimes(3);
    // se espera entre intentos, no después del último
    expect(fakeSleep).toHaveBeenCalledTimes(2);
  });

  test('se detiene si shouldContinue devuelve false (pantalla desmontada)', async () => {
    const task = jest.fn().mockRejectedValue(new Error('sin posición'));
    await expect(
      retryAsync(task, { attempts: 3, sleep: fakeSleep, shouldContinue: () => false }),
    ).rejects.toThrow('sin posición');
    expect(task).toHaveBeenCalledTimes(1);
  });
});
