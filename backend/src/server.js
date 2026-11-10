// AI-assisted: see docs/AI_LOG.md #10
// Servidor Express de BoliTax. Por ahora solo /health; en el módulo de pagos se agregan
// los endpoints de Mercado Pago (el access_token vivirá solo en backend/.env).
import express from 'express';

const app = express();
app.use(express.json());

// comprobación rápida de que el servidor está vivo
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'bolitax-backend', time: new Date().toISOString() });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Backend de BoliTax escuchando en http://localhost:${port}`);
});
