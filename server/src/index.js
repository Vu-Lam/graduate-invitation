import './env.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDb } from './db.js';
import guestsRouter from './routes/guests.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        mediaSrc: ["'self'"],
        connectSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"]
      }
    }
  })
);
app.use(express.json({ limit: '10kb' }));

app.use(
  '/api',
  rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false })
);
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api', guestsRouter);
app.use('/api', (req, res) => res.status(404).json({ error: 'Không tìm thấy.' }));

// Production: phục vụ luôn bản build của React
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: '1h', index: false }));
  app.get('*', (req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Có lỗi xảy ra, bạn thử lại sau nhé.' });
});

const port = Number(process.env.PORT) || 3001;

connectDb(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => console.log(`Server chạy tại http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('Không kết nối được MongoDB:', err.message);
    process.exit(1);
  });
