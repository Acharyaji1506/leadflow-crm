import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import leadRoutes from './routes/lead.routes';
import auditLogRoutes from './routes/auditLog.routes';
import { errorHandler, notFound } from './middlewares/errorHandler';

const app: Application = express();

// ─── Security Middleware ─────────────────────────────────────────────────────

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'https://*.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow server-to-server
      const allowed =
        allowedOrigins.some((o) => {
          if (o.includes('*')) {
            const pattern = o.replace('*.', '.*\\.');
            return new RegExp(pattern).test(origin);
          }
          return o === origin;
        });
      if (allowed) {
        callback(null, true);
      } else {
        callback(null, true); // In production, tighten this
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

app.use('/api/', limiter);
app.use('/api/leads', strictLimiter);

// ─── Body Parsing ────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Sanitization ────────────────────────────────────────────────────────────

app.use(mongoSanitize());

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/leads', leadRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

export default app;
