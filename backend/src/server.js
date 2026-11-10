// AI-assisted: see docs/AI_LOG.md #10
// Servidor Express de BoliTax: /health y los endpoints de pago con Wompi
// (las llaves de Wompi viven solo en backend/.env).
import express from 'express';
// AI-assisted: see docs/AI_LOG.md #14
import { paymentsRouter } from './routes/payments.js';

const app = express();
app.use(express.json());

// comprobación rápida de que el servidor está vivo
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'bolitax-backend', time: new Date().toISOString() });
});

// AI-assisted: see docs/AI_LOG.md #15
// registro de cada petición de pago (método, ruta, código y duración) para diagnosticar
// problemas como una respuesta que nunca llega a la app
app.use('/payments', (req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} /payments${req.path} -> ${res.statusCode} (${Date.now() - startedAt} ms)`);
  });
  next();
});

// AI-assisted: see docs/AI_LOG.md #14
app.use('/payments', paymentsRouter);

// errores: se responde con el código y un mensaje en español; el detalle técnico queda en consola
// (Express reconoce este manejador porque recibe 4 parámetros)
app.use((error, _req, res, _next) => {
  const status = error.status ?? 500;
  if (status >= 500) console.error('Error en el backend:', error);
  res.status(status).json({ error: status >= 500 && !error.status ? 'Error interno del servidor.' : error.message });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Backend de BoliTax escuchando en http://localhost:${port}`);
});
